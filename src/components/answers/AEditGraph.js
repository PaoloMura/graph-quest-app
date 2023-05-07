import React, { useEffect } from 'react'
import { triggerGraphAction } from '../utilities/graph-events'

export const initialAnswer = (question) => []

export function controls (question) {
  const ctr = []

  if (question.settings.add_nodes) {
    ctr.push('Tap on the background to add a node.')
  }

  if (question.settings.remove_nodes) {
    ctr.push('Rick-click on a node to remove it.')
  }

  if (question.settings.add_edges) {
    ctr.push('Drag from one node to another to add an edge between them.')
  }

  if (question.settings.remove_edges) {
    ctr.push('Right-click on an edge to remove it.')
  }

  if (question.settings.change_colour) {
    ctr.push('Tap on a node to change its colour.')
  }
}

export const validate = (question, answer) => {}

export function verify (question, answer) {
  // TODO: implement this
}

export function onReset (question, answer) {
  // TODO: implement this
}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
  function handleTapBg (event) {
    const params = {
      x: event.detail.x,
      y: event.detail.y
    }
    triggerGraphAction('addNode', params, event.detail.graphKey)
  }

  function handleCxtTapNode (event) {
    const params = {
      node: event.detail.vertex
    }
    triggerGraphAction('removeNode', params, event.detail.graphKey)
  }

  useEffect(() => {
    document.addEventListener('tap_bg', handleTapBg)
    document.addEventListener('cxttap_node', handleCxtTapNode)

    return () => {
      document.removeEventListener('tap_bg', handleTapBg)
      document.removeEventListener('cxttap_node', handleCxtTapNode)
    }
  }, [])
  return (
    <div>
      Hello World!
    </div>
  )
}

export function DisabledAnswer ({ question, answer, progress }) {
  return (
    <div>
      Hello World!
    </div>
  )
}
