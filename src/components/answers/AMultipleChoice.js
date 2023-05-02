import React from 'react'
import Form from 'react-bootstrap/Form'

export const initialAnswer = (question) => {
  return question.solutions.map((txt, _) => [txt, false])
}

export const controls = (question) => undefined

export const validate = (question, answer) => ''

export function verify (question, answer) {
  for (let i = 0; i < question.solutions.length; i++) {
    if (question.solutions[i][1] !== answer[i][1]) {
      return false
    }
  }
  return true
}

export const onReset = (question, answer) => {}

export function Answer ({ question, answer, progress, setAnswer, setError }) {
  const handleChangeAnswer = (event, key) => {
    setAnswer(answer.map((ans, idx) => {
      if (question.settings.single_selection) {
        return idx === key ? [ans[0], !ans[1]] : [ans[0], false]
      } else {
        return idx === key ? [ans[0], !ans[1]] : [ans[0], ans[1]]
      }
    }))
  }

  return (
    <div>
      {
        answer.map((ans, idx) => (
          <Form.Check
            key={ans[0]}
            type={question.settings.single_selection ? 'radio' : 'checkbox'}
            label={ans[0]}
            checked={ans[1]}
            onChange={(e) => handleChangeAnswer(e, idx)}
          />
        ))
      }
    </div>
  )
}

export function DisabledAnswer ({ question, answer, progress }) {
  return (
    <div>
      {
        answer.map(ans => {
          return (
            <Form.Check
              key={ans[0]}
              disabled
              readOnly
              type={question.settings.single_selection ? 'radio' : 'checkbox'}
              label={ans[0]}
              checked={ans[1]}
            />
          )
        })
      }
    </div>
  )
}
