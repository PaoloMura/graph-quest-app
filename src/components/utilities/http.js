import axios from 'axios'

export function getSolution (question, answer, setProgress) {
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
  }).catch((error) => {
    if (error.response) {
      console.log(error.response)
    }
  })
}
