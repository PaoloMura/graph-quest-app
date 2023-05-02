import axios from 'axios'
import { triggerGraphEvent } from './graph-events'

const updateData = (data) => {
  if (data.highlighted_nodes !== null) {
    for (const node of data.highlighted_nodes) {
      const params = {
        vertex: node,
        type: 'underlay',
        highlight: true
      }
      triggerGraphEvent('highlightVertex', params, 0)
    }
  }
  if (data.highlighted_edges !== null) {
    for (const edge of data.highlighted_edges) {
      const params = {
        v1: edge[0],
        v2: edge[1],
        type: 'underlay',
        highlight: true
      }
      triggerGraphEvent('highlightEdge', params, 0)
    }
  }
}

export function getFeedback (question, answer, setProgress) {
  let data

  axios({
    method: 'POST',
    url: '/api/feedback/' + question.file + '/' + question.class,
    data: {
      answer,
      graphs: question.graphs,
      data: question.settings.data
    }
  }).then((response) => {
    const res = response.data
    const status = res.result ? 'correct' : 'incorrect'
    setProgress(answer, status, res.feedback)
    data = {
      highlighted_nodes: res.highlighted_nodes,
      highlighted_edges: res.highlighted_edges
    }
    setTimeout(() => { updateData(data) }, 300)
  }).catch((error) => {
    if (error.response) {
      console.log(error.response)
    }
  })
}
