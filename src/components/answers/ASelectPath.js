import React, { useEffect, useState } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { getSolution } from '../utilities/http'
import Description from '../helpers/Description'
import SubmitButton from '../helpers/SubmitButton'

export default function ASelectPath ({ question, progress, onSubmit, onNext, submitStatus }) {
  const [answer, setAnswer] = useState(() => (
    progress.answer !== undefined ? progress.answer : []
  ))

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer([])
  }, [progress])

  const controls = [
    'Click on a vertex to select it.',
    'Click on the last visited vertex/edge to remove it.'
  ]

  const getEdge = (u, v) => {
    if (question.graphs[0].directed) return [u, v]
    else if (question.graphs[0].elements.edges.find(e => e[0] === u && e[1] === v)) return [u, v]
    else return [v, u]
  }

  const handleReset = () => {
    let prev
    for (const vertex of answer) {
      triggerGraphAction('highlightVertex', { vertex, highlight: false }, 0)
      if (prev !== undefined) {
        const [u, v] = getEdge(prev, vertex)
        triggerGraphAction('highlightEdge', { v1: u, v2: v, highlight: false }, 0)
      }
      prev = vertex
    }
    setAnswer([])
  }

  const handleSubmit = () => {
    // Determine whether the answer is correct
    const ans = answer.toString()
    if (question.settings.feedback) {
      getSolution(question, answer, onSubmit)
    } else {
      for (const sol of question.solutions) {
        if (sol.toString() === ans) {
          onSubmit(answer, 'correct', '')
          return
        }
      }
      onSubmit(answer, 'incorrect', '')
    }
  }

  useEffect(() => {
    function addNode (value, graphKey) {
      setAnswer([...answer, value])
      if (answer.length > 0) {
        // Un-highlight the previous vertex
        triggerGraphAction('highlightVertex', { vertex: answer.at(-1), highlight: false }, graphKey)
        // Highlight the edge
        const params = {
          v1: answer.at(-1),
          v2: value,
          highlight: true
        }
        triggerGraphAction('highlightEdge', params, graphKey)
      }
      // Highlight this vertex
      triggerGraphAction('highlightVertex', { vertex: value, highlight: true }, graphKey)
    }

    function popNode (graphKey) {
      if (answer.length === 0) return
      // Un-highlight the current vertex
      triggerGraphAction('highlightVertex', { vertex: answer.at(-1), highlight: false }, graphKey)
      if (answer.length > 1) {
        // Highlight the previously selected vertex
        triggerGraphAction('highlightVertex', { vertex: answer.at(-2), highlight: true }, graphKey)
        // Un-highlight the current edge if it does not appear anywhere else in the answer
        const v1 = answer.at(-2)
        const v2 = answer.at(-1)
        const checkAdjacent = (val, idx) => {
          return val === v1 && idx < answer.length - 2 && answer.at(idx + 1) === v2
        }
        if (answer.find(checkAdjacent) === undefined) {
          triggerGraphAction('highlightEdge', { v1, v2, highlight: false }, graphKey)
        }
      }
      setAnswer(answer.slice(0, -1))
    }

    function areAdjacent (v1, v2, graphKey) {
      for (const edge of question.graphs[graphKey].elements.edges) {
        const [w1, w2] = [parseInt(edge.data.source), parseInt(edge.data.target)]
        if (question.graphs[graphKey].directed) {
          if (v1 === w1 && v2 === w2) return true
        } else {
          if ((v1 === w1 && v2 === w2) || (v1 === w2 && v2 === w1)) return true
        }
      }
      return false
    }

    // Returns true if the given edge is unvisited
    function isUnvisited (v1, v2, graphKey) {
      if (answer.length < 2) return true
      for (let i = 0; i < answer.length - 1; i++) {
        if (question.graphs[graphKey].directed) {
          if (v1 === answer[i] && v2 === answer[i + 1]) return false
        } else {
          if (
            (v1 === answer[i] && v2 === answer[i + 1]) ||
            (v2 === answer[i] && v1 === answer[i + 1])
          ) return false
        }
      }
      return true
    }

    function handleTapNode (event) {
      if (progress.status !== 'unanswered') return
      const vertex = event.detail.vertex
      // If clicking on the latest vertex or its predecessor, remove it
      if (answer.length > 0 && answer.at(-1) === vertex) popNode(event.detail.graphKey)
      // else if (answer.length > 1 && answer.at(-2) === vertex) popNode()
      // Only add a vertex if adjacent to the previous and the edge is unvisited
      else if (answer.length === 0) addNode(vertex, event.detail.graphKey)
      else if (areAdjacent(answer.at(-1), vertex, event.detail.graphKey) &&
        isUnvisited(answer.at(-1), vertex, event.detail.graphKey)) {
        addNode(vertex, event.detail.graphKey)
      }
    }

    function handleTapEdge (event) {
      if (progress.status !== 'unanswered') return
      const [v1, v2] = [event.detail.source, event.detail.target]
      if (answer.length > 1 &&
        (
          (v1 === answer.at(-2) && v2 === answer.at(-1)) ||
          (v2 === answer.at(-2) && v1 === answer.at(-1))
        )
      ) popNode(event.detail.graphKey)
    }

    document.addEventListener('tap_node', handleTapNode)
    document.addEventListener('tap_edge', handleTapEdge)

    return () => {
      document.removeEventListener('tap_node', handleTapNode)
      document.removeEventListener('tap_edge', handleTapEdge)
    }
  }, [answer, progress, question.graphs])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      if (progress.answer.length > 1) {
        for (let i = 1; i < progress.answer.length; i++) {
          triggerGraphAction(
            'highlightEdge',
            { v1: progress.answer[i - 1], v2: progress.answer[i], highlight: true },
            0
          )
        }
      }
      triggerGraphAction(
        'highlightVertex',
        { vertex: progress.answer.at(-1), highlight: true },
        0
      )
    }
  }, [progress])

  if (progress.status === 'unanswered') {
    return (
      <div>
        <Description description={question.description} controls={controls} />
        <Form>
          <Form.Control
            disabled
            readOnly
            value={answer.toString()}
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
