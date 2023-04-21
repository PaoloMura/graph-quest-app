import React, { useEffect, useState } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Description from '../helpers/Description'
import { equalSets } from '../utilities/sets'
import { getSolution } from '../utilities/http'
import SubmitButton from '../helpers/SubmitButton'

export default function AVertexSet ({ question, progress, onSubmit, onNext, submitStatus }) {
  const [answer, setAnswer] = useState(() => (
    progress.answer !== undefined ? progress.answer : []
  ))

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer([])
  }, [progress])

  const controls = [
    'Click on a vertex to select/unselect it.'
  ]

  if (question.settings.selection_limit > 1) {
    controls.push('Click and drag to select/unselect multiple vertices.')
  }

  if (question.settings.selection_limit !== -1) {
    controls.push(`You can select at most ${question.settings.selection_limit} vertices.`)
  }

  const handleReset = () => {
    for (const vertex of answer) {
      triggerGraphAction(
        'highlightVertex',
        { vertex, highlight: false },
        0
      )
    }
    setAnswer([])
  }

  const handleSubmit = () => {
    // Determine whether the answer is correct
    const ans = new Set(answer)
    if (question.settings.feedback) {
      getSolution(question, answer, onSubmit)
    } else {
      for (const solution of question.solutions) {
        const sol = new Set(solution)
        if (equalSets(sol, ans)) {
          onSubmit(answer, 'correct', '')
          return
        }
      }
      onSubmit(answer, 'incorrect', '')
    }
  }

  useEffect(() => {
    function handleTapNode (event) {
      if (progress.status !== 'unanswered') return
      const vertex = event.detail.vertex
      if (answer.includes(vertex)) {
        setAnswer(answer.filter(v => v !== vertex))
        triggerGraphAction('highlightVertex', { vertex, highlight: false }, event.detail.graphKey)
      } else {
        const limit = question.settings.selection_limit
        if (limit === -1 || limit === 1 || answer.length < limit) {
          triggerGraphAction('highlightVertex', { vertex, highlight: true }, event.detail.graphKey)
          if (limit === 1 && answer.length === 1) {
            triggerGraphAction('highlightVertex', { vertex: answer[0], highlight: false }, event.detail.graphKey)
            setAnswer([vertex])
          } else {
            setAnswer([...answer, vertex])
          }
        }
      }
    }

    function handleBoxEnd (event) {
      if (progress.status !== 'unanswered') return
      const nodes = event.detail.nodes
      const numInAnswer = nodes.reduce((acc, n) => answer.includes(n) ? acc + 1 : acc, 0)
      if (numInAnswer === nodes.length) {
        // Un-highlight all and remove them from answer
        for (const n of nodes) {
          triggerGraphAction('highlightVertex', { vertex: n, highlight: false }, event.detail.graphKey)
        }
        setAnswer(answer.filter(a => !nodes.includes(a)))
      } else {
        // Highlight and add all missing to answer
        const missing = nodes.filter(n => !answer.includes(n))
        const limit = question.settings.selection_limit
        if (limit === -1 || answer.length + missing.length <= limit) {
          for (const n of nodes) {
            triggerGraphAction('highlightVertex', { vertex: n, highlight: true }, event.detail.graphKey)
          }
          setAnswer(answer.concat(missing))
        }
      }
    }

    document.addEventListener('tap_node', handleTapNode)
    document.addEventListener('box_end', handleBoxEnd)

    return () => {
      document.removeEventListener('tap_node', handleTapNode)
      document.removeEventListener('box_end', handleBoxEnd)
    }
  }, [answer, progress, question.settings.selection_limit])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      for (const v of progress.answer) {
        triggerGraphAction(
          'highlightVertex',
          { vertex: v, highlight: true },
          0
        )
      }
    }
  }, [progress])

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
            value={answer.toString()}
          />
          <br />
          <Button size='lg' variant='secondary' onClick={handleReset}>Reset</Button>
          <br />
          <br />
          <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
        </Form>
      </div>
    )
  } else {
    return (
      <div>
        <Description description={question.description} />
        <Form>
          <Form.Control
            disabled
            readOnly
            value={answer.toString()}
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
