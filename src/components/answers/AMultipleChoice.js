import React, { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'
import { getSolution } from '../utilities/http'
import Description from '../helpers/Description'
import SubmitButton from '../helpers/SubmitButton'

export default function AMultipleChoice ({ question, progress, onSubmit, onNext, submitStatus }) {
  const [answer, setAnswer] = useState(() => {
    if (progress.answer !== undefined) return progress.answer
    else return question.solutions.map((txt, _) => [txt, false])
  })

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer(question.solutions.map((txt, _) => [txt, false]))
  }, [progress, question])

  const handleSubmit = () => {
    // Determine whether the answer is correct
    if (question.settings.feedback) {
      getSolution(question, answer, onSubmit)
    } else {
      for (let i = 0; i < question.solutions.length; i++) {
        if (question.solutions[i][1] !== answer[i][1]) {
          onSubmit(answer, 'incorrect', '')
          return
        }
      }
      onSubmit(answer, 'correct', '')
    }
  }

  const handleChangeAnswer = (event, key) => {
    setAnswer(answer.map((ans, idx) => {
      if (question.settings.single_selection) {
        return idx === key ? [ans[0], !ans[1]] : [ans[0], false]
      } else {
        return idx === key ? [ans[0], !ans[1]] : [ans[0], ans[1]]
      }
    }))
  }

  if (progress.status === 'unanswered') {
    return (
      <div>
        <Description
          description={question.description}
        />
        <Form>
          {
          answer.map((ans, idx) => {
            return (
              <Form.Check
                key={ans[0]}
                type={question.settings.single_selection ? 'radio' : 'checkbox'}
                label={ans[0]}
                checked={ans[1]}
                onChange={(e) => handleChangeAnswer(e, idx)}
              />
            )
          })
        }
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
