import React, { useEffect } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Form from 'react-bootstrap/Form'
import { equalSets } from '../utilities/sets'

export const initialAnswer = (question) => []

export function controls (question) {
  const ctr = ['Click on a vertex to select/unselect it.']

  if (question.settings.selection_limit > 1) {
    ctr.push('Click and drag to select/unselect multiple vertices.')
  }

  if (question.settings.selection_limit !== -1) {
    ctr.push(`You can select at most ${question.settings.selection_limit} vertices.`)
  }

  return ctr
}

export const validate = (question, answer) => {}

export function verify (question, answer) {
  const ans = new Set(answer)
  for (const solution of question.solutions) {
    const sol = new Set(solution)
    if (equalSets(sol, ans)) {
      return true
    }
  }
  return false
}

export function onReset (question, answer) {
  answer.forEach(vertex => {
    const params = {
      vertex,
      type: 'colour',
      highlight: false
    }
    triggerGraphAction('highlightVertex', params, 0)
  })
}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
  useEffect(() => {
    function handleTapNode (event) {
      const vertex = event.detail.vertex
      if (answer.includes(vertex)) {
        setAnswer(answer.filter(v => v !== vertex))
        const params = {
          vertex,
          type: 'colour',
          highlight: false
        }
        triggerGraphAction('highlightVertex', params, event.detail.graphKey)
      } else {
        const limit = question.settings.selection_limit
        if (limit === -1 || limit === 1 || answer.length < limit) {
          let params = {
            vertex,
            type: 'colour',
            highlight: true
          }
          triggerGraphAction('highlightVertex', params, event.detail.graphKey)
          if (limit === 1 && answer.length === 1) {
            params = {
              vertex: answer[0],
              type: 'colour',
              highlight: false
            }
            triggerGraphAction('highlightVertex', params, event.detail.graphKey)
            setAnswer([vertex])
          } else {
            setAnswer([...answer, vertex])
          }
        }
      }
    }

    function handleBoxEnd (event) {
      const nodes = event.detail.nodes
      const numInAnswer = nodes.reduce((acc, n) => answer.includes(n) ? acc + 1 : acc, 0)
      if (numInAnswer === nodes.length) {
        // Un-highlight all and remove them from answer
        for (const n of nodes) {
          const params = {
            vertex: n,
            type: 'colour',
            highlight: false
          }
          triggerGraphAction('highlightVertex', params, event.detail.graphKey)
        }
        setAnswer(answer.filter(a => !nodes.includes(a)))
      } else {
        // Highlight and add all missing to answer
        const missing = nodes.filter(n => !answer.includes(n))
        const limit = question.settings.selection_limit
        if (limit === -1 || answer.length + missing.length <= limit) {
          for (const n of nodes) {
            const params = {
              vertex: n,
              type: 'colour',
              highlight: true
            }
            triggerGraphAction('highlightVertex', params, event.detail.graphKey)
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
  }, [answer, setAnswer, progress, question])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      progress.answer.forEach(vertex => {
        const params = {
          vertex,
          type: 'colour',
          highlight: true
        }
        triggerGraphAction('highlightVertex', params, 0)
      })
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
      progress.answer.forEach(vertex => {
        const params = {
          vertex,
          type: 'colour',
          highlight: true
        }
        triggerGraphAction('highlightVertex', params, 0)
      })
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
