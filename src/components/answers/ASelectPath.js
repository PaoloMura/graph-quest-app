import React, { useEffect } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Form from 'react-bootstrap/Form'

export const initialAnswer = (question) => []

export const controls = (question) => [
  'Click on a vertex to select it.',
  'Click on the last visited vertex/edge to remove it.'
]

export const validate = (question, answer) => {}

export function verify (question, answer) {
  const ans = answer.toString()
  question.solutions.forEach(sol => {
    if (sol.toString() === ans) {
      return true
    }
  })
  return false
}

export function onReset (question, answer) {
  const getEdge = (u, v) => {
    if (question.graphs[0].directed) return [u, v]
    else if (question.graphs[0].elements.edges.find(e => e[0] === u && e[1] === v)) return [u, v]
    else return [v, u]
  }

  let prev
  for (const vertex of answer) {
    let params = {
      vertex,
      type: 'overlay',
      highlight: false
    }
    triggerGraphAction('highlightVertex', params, 0)
    if (prev !== undefined) {
      const [u, v] = getEdge(prev, vertex)
      params = {
        v1: u,
        v2: v,
        type: 'overlay',
        highlight: false
      }
      triggerGraphAction('highlightEdge', params, 0)
    }
    prev = vertex
  }
}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
  useEffect(() => {
    function addNode (value, graphKey) {
      setAnswer([...answer, value])
      if (answer.length > 0) {
        // Un-highlight the previous vertex
        let params = {
          vertex: answer.at(-1),
          type: 'overlay',
          highlight: false
        }
        triggerGraphAction('highlightVertex', params, graphKey)
        // Highlight the edge
        params = {
          v1: answer.at(-1),
          v2: value,
          type: 'overlay',
          highlight: true
        }
        triggerGraphAction('highlightEdge', params, graphKey)
      }
      // Highlight this vertex
      const params = {
        vertex: value,
        type: 'overlay',
        highlight: true
      }
      triggerGraphAction('highlightVertex', params, graphKey)
    }

    function popNode (graphKey) {
      if (answer.length === 0) return
      // Un-highlight the current vertex
      const params = {
        vertex: answer.at(-1),
        type: 'overlay',
        highlight: false
      }
      triggerGraphAction('highlightVertex', params, graphKey)
      if (answer.length > 1) {
        // Highlight the previously selected vertex
        const params = {
          vertex: answer.at(-2),
          type: 'overlay',
          highlight: true
        }
        triggerGraphAction('highlightVertex', params, graphKey)
        // Un-highlight the current edge if it does not appear anywhere else in the answer
        const v1 = answer.at(-2)
        const v2 = answer.at(-1)
        const checkAdjacent = (val, idx) => {
          return val === v1 && idx < answer.length - 2 && answer.at(idx + 1) === v2
        }
        if (answer.find(checkAdjacent) === undefined) {
          const params = {
            v1,
            v2,
            type: 'overlay',
            highlight: false
          }
          triggerGraphAction('highlightEdge', params, graphKey)
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
  }, [answer, setAnswer, progress, question.graphs])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      if (progress.answer.length > 1) {
        for (let i = 1; i < progress.answer.length; i++) {
          const params = {
            v1: progress.answer[i - 1],
            v2: progress.answer[i],
            type: 'overlay',
            highlight: true
          }
          triggerGraphAction('highlightEdge', params, 0)
        }
      }
      const params = {
        vertex: progress.answer.at(-1),
        type: 'overlay',
        highlight: true
      }
      triggerGraphAction('highlightVertex', params, 0)
    }
  }, [progress])

  return (
    <Form.Control
      disabled
      readOnly
      value={answer.toString()}
    />
  )
}

export function DisabledAnswer ({ question, answer, progress }) {
  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      if (progress.answer.length > 1) {
        for (let i = 1; i < progress.answer.length; i++) {
          const params = {
            v1: progress.answer[i - 1],
            v2: progress.answer[i],
            type: 'overlay',
            highlight: true
          }
          triggerGraphAction('highlightEdge', params, 0)
        }
      }
      const params = {
        vertex: progress.answer.at(-1),
        type: 'overlay',
        highlight: true
      }
      triggerGraphAction('highlightVertex', params, 0)
    }
  }, [progress])

  return (
    <Form.Control
      disabled
      readOnly
      value={answer.toString()}
    />
  )
}
