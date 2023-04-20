import React, { useEffect, useState } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { equalSets } from '../utilities/sets'
import { getSolution } from '../utilities/http'
import Description from '../helpers/Description'
import SubmitButton from '../helpers/SubmitButton'

export default function AEdgeSet ({ question, progress, onSubmit, onNext, submitStatus }) {
  const [answer, setAnswer] = useState(() => (
    progress.answer !== undefined ? progress.answer : []
  ))

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer([])
  }, [progress])

  const controls = [
    'Click on an edge to select/unselect it.',
    'Click and drag to select/unselect multiple edges.'
  ]
  if (question.settings.selection_limit !== -1) {
    controls.push(`You can select at most ${question.settings.selection_limit} edges`)
  }

  const handleReset = () => {
    for (const [source, target] of answer) {
      triggerGraphAction(
        'highlightEdge',
        { v1: source, v2: target, highlight: false },
        0
      )
    }
    setAnswer([])
  }

  const equalNestedSets = (xs, ys) => {
    if (xs.size !== ys.size) return false
    for (const x of xs) {
      for (const y of ys) {
        if (equalSets(x, y)) return true
      }
    }
    return false
  }

  const answerInSolutions = () => {
    const ans = new Set(answer.map(edge => new Set(edge)))
    for (const solution of question.solutions) {
      const sol = new Set(solution.map(edge => new Set(edge)))
      if (equalNestedSets(sol, ans)) {
        return true
      }
    }
    return false
  }

  const handleSubmit = () => {
    // Determine whether the answer is correct
    if (question.settings.feedback) {
      getSolution(question, answer, onSubmit)
    } else if (answerInSolutions()) onSubmit(answer, 'correct', '')
    else onSubmit(answer, 'incorrect', '')
  }

  useEffect(() => {
    const edgeInAnswer = (edge, graphKey) => {
      const [u, v] = edge
      for (const [x, y] of answer) {
        if (question.graphs[graphKey].directed) {
          if (u === x && v === y) return true
        } else {
          if ((u === x && v === y) || (u === y && v === x)) return true
        }
      }
      return false
    }

    const edgeInArray = (edge, array) => {
      const [u, v] = edge
      for (const [x, y] of array) {
        if (u === x && v === y) return true
      }
      return false
    }

    const eqEdges = (e, f) => {
      return (e[0] === f[0] && e[1] === f[1])
    }

    const edgesDifferent = (e, f, graphKey) => {
      if (question.graphs[graphKey].directed) {
        return !eqEdges(e, [f[0], f[1]])
      } else {
        return (!eqEdges(e, [f[0], f[1]])) && (!eqEdges(e, [f[1], f[0]]))
      }
    }

    function handleTapEdge (event) {
      if (progress.status !== 'unanswered') return
      const source = event.detail.source
      const target = event.detail.target

      if (edgeInAnswer([source, target], event.detail.graphKey)) {
        setAnswer(answer.filter((e) => edgesDifferent(e, [source, target], event.detail.graphKey)))
        triggerGraphAction(
          'highlightEdge',
          { v1: source, v2: target, highlight: false },
          event.detail.graphKey
        )
      } else {
        const limit = question.settings.selection_limit
        if (limit === -1 || limit === 1 || answer.length < limit) {
          setAnswer([...answer, [source, target]])
          triggerGraphAction(
            'highlightEdge',
            { v1: source, v2: target, highlight: true },
            event.detail.graphKey
          )
          if (limit === 1 && answer.length === 1) {
            triggerGraphAction(
              'highlightEdge',
              { v1: answer[0][0], v2: answer[0][1], highlight: false },
              event.detail.graphKey
            )
            setAnswer([[source, target]])
          } else {
            setAnswer([...answer, [source, target]])
          }
        }
      }
    }

    function handleBoxEnd (event) {
      if (progress.status !== 'unanswered') return
      const edges = event.detail.edges
      const numInAnswer = edges.reduce((acc, e) => {
        return edgeInAnswer(e, event.detail.graphKey) ? acc + 1 : acc
      }, 0)
      if (numInAnswer === edges.length) {
        // Un-highlight all and remove them from answer
        for (const e of edges) {
          triggerGraphAction(
            'highlightEdge',
            { v1: e[0], v2: e[1], highlight: false },
            event.detail.graphKey
          )
        }
        setAnswer(answer.filter(e => !edgeInArray(e, edges)))
      } else {
        // Highlight and add all missing to answer
        const missing = edges.filter(e => !edgeInAnswer(e, event.detail.graphKey))
        if (question.settings.selection_limit === -1 ||
          answer.length + missing.length <= question.settings.selection_limit) {
          for (const m of missing) {
            triggerGraphAction(
              'highlightEdge',
              { v1: m[0], v2: m[1], highlight: true },
              event.detail.graphKey
            )
          }
          setAnswer(answer.concat(missing))
        }
      }
    }

    document.addEventListener('tap_edge', handleTapEdge)
    document.addEventListener('box_end', handleBoxEnd)

    return () => {
      document.removeEventListener('tap_edge', handleTapEdge)
      document.removeEventListener('box_end', handleBoxEnd)
    }
  }, [answer, progress, question])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      for (const [u, v] of progress.answer) {
        triggerGraphAction(
          'highlightEdge',
          { v1: u, v2: v, highlight: true },
          0
        )
      }
    }
  }, [progress])

  const answerToString = () => {
    const edges = answer.map(([u, v], _) => `(${u},${v})`)
    return edges.join(',')
  }

  if (progress.status === 'unanswered') {
    return (
      <div>
        <Description
          description={question.description}
          controls={controls}
        />
        <Form>
          <Form.Control
            disabled
            readOnly
            value={answerToString()}
          />
          <br />
          <Button variant='secondary' onClick={handleReset}>Reset</Button>
          <br />
          <br />
          <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
        </Form>
      </div>
    )
  } else {
    return (
      <div>
        <Description
          description={question.description}
        />
        <Form>
          <Form.Control
            disabled
            readOnly
            value={answerToString()}
          />
          <p className={progress.status === 'correct' ? 'text-correct' : 'text-incorrect'}>
            {progress.status === 'correct' ? 'Correct!' : 'Incorrect.'}
          </p>
          <p>
            {progress.feedback}
          </p>
          <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
        </Form>
      </div>
    )
  }
}
