import axios from 'axios'

export function getSolution (question, answer, setProgress, setQuestion) {
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
    setQuestion(data)
  }).catch((error) => {
    if (error.response) {
      console.log(error.response)
    }
  })
}
