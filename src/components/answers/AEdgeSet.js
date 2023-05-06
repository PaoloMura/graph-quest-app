import React, { useEffect } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'
import Form from 'react-bootstrap/Form'
import { equalNestedSets } from '../utilities/sets'

export const initialAnswer = (question) => []

export function controls (question) {
  const ctr = [
    'Click on an edge to select/unselect it.',
    'Click and drag to select/unselect multiple edges.'
  ]

  if (question.settings.selection_limit !== -1) {
    ctr.push(`You can select at most ${question.settings.selection_limit} edges`)
  }

  return ctr
}

export const validate = (question, answer) => {}

export function verify (question, answer) {
  const ans = new Set(answer.map(edge => new Set(edge)))
  for (const solution of question.solutions) {
    const sol = new Set(solution.map(edge => new Set(edge)))
    if (equalNestedSets(sol, ans)) {
      return true
    }
  }
  return false
}

export function onReset (question, answer) {
  for (const [source, target] of answer) {
    const params = {
      v1: source,
      v2: target,
      type: 'overlay',
      highlight: false
    }
    triggerGraphAction('highlightEdge', params, 0)
  }
}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
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
      const source = event.detail.source
      const target = event.detail.target

      if (edgeInAnswer([source, target], event.detail.graphKey)) {
        setAnswer(answer.filter((e) => edgesDifferent(e, [source, target], event.detail.graphKey)))
        const params = {
          v1: source,
          v2: target,
          type: 'overlay',
          highlight: false
        }
        triggerGraphAction('highlightEdge', params, event.detail.graphKey)
      } else {
        const limit = question.settings.selection_limit
        if (limit === -1 || limit === 1 || answer.length < limit) {
          setAnswer([...answer, [source, target]])
          const params = {
            v1: source,
            v2: target,
            type: 'overlay',
            highlight: true
          }
          triggerGraphAction('highlightEdge', params, event.detail.graphKey)
          if (limit === 1 && answer.length === 1) {
            const params = {
              v1: answer[0][0],
              v2: answer[0][1],
              type: 'overlay',
              highlight: false
            }
            triggerGraphAction('highlightEdge', params, event.detail.graphKey)
            setAnswer([[source, target]])
          } else {
            setAnswer([...answer, [source, target]])
          }
        }
      }
    }

    function handleBoxEnd (event) {
      const edges = event.detail.edges
      const numInAnswer = edges.reduce((acc, e) => {
        return edgeInAnswer(e, event.detail.graphKey) ? acc + 1 : acc
      }, 0)
      if (numInAnswer === edges.length) {
        // Un-highlight all and remove them from answer
        for (const e of edges) {
          const params = {
            v1: e[0],
            v2: e[1],
            type: 'overlay',
            highlight: false
          }
          triggerGraphAction('highlightEdge', params, event.detail.graphKey)
        }
        setAnswer(answer.filter(e => !edgeInArray(e, edges)))
      } else {
        // Highlight and add all missing to answer
        const missing = edges.filter(e => !edgeInAnswer(e, event.detail.graphKey))
        if (question.settings.selection_limit === -1 ||
          answer.length + missing.length <= question.settings.selection_limit) {
          for (const m of missing) {
            const params = {
              v1: m[0],
              v2: m[1],
              type: 'overlay',
              highlight: true
            }
            triggerGraphAction('highlightEdge', params, event.detail.graphKey)
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
  }, [answer, setAnswer, progress, question])

  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      for (const [u, v] of progress.answer) {
        const params = {
          v1: u,
          v2: v,
          type: 'overlay',
          highlight: true
        }
        triggerGraphAction('highlightEdge', params, 0)
      }
    }
  }, [progress])

  const edges = answer.map(([u, v], _) => `(${u},${v})`)
  const answerStr = edges.join(',')

  return (
    <Form.Control
      disabled
      readOnly
      value={answerStr}
    />
  )
}

export function DisabledAnswer ({ question, answer, progress }) {
  useEffect(() => {
    if (progress.answer !== undefined && progress.answer.length > 0) {
      for (const [u, v] of progress.answer) {
        const params = {
          v1: u,
          v2: v,
          type: 'overlay',
          highlight: true
        }
        triggerGraphAction('highlightEdge', params, 0)
      }
    }
  }, [progress])

  const edges = answer.map(([u, v], _) => `(${u},${v})`)
  const answerStr = edges.join(',')

  return (
    <Form.Control
      disabled
      readOnly
      value={answerStr}
    />
  )
}
