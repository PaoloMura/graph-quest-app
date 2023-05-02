import React from 'react'
import Form from 'react-bootstrap/Form'

export const initialAnswer = (question) => ''

export const controls = (question) => undefined

export function validate (question, answer) {
  if (question.settings.data_type === 'integer') {
    const parsed = Number(answer)
    if (isNaN(parsed)) {
      return 'Answer must be an integer'
    } else if (!Number.isInteger(parsed)) {
      return 'Answer must be an integer'
    } else {
      return ''
    }
  }
}

export function verify (question, answer) {
  const ans = answer.toString()
  for (const sol of question.solutions) {
    if (sol.toString() === ans) {
      return true
    }
  }
  return false
}

export const onReset = (question, answer) => {}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
  const handleChangeAnswer = (event) => {
    setAnswer(event.target.value)
    setError('')
  }

  return (
    <Form.Control
      value={answer}
      onChange={handleChangeAnswer}
    />
  )
}

export function DisabledAnswer ({ question, answer, progress }) {
  return (
    <Form.Control
      disabled
      readOnly
      value={answer.toString()}
    />
  )
}
