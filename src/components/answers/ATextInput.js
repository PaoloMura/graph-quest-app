import React, { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'
import { getSolution } from '../utilities/http'
import Description from '../helpers/Description'
import SubmitButton from '../helpers/SubmitButton'

export default function ATextInput ({ question, onSetQuestion, progress, onSubmit, onNext, submitStatus }) {
  const [answer, setAnswer] = useState(() => (
    progress.answer !== undefined ? progress.answer : ''
  ))
  const [error, setError] = useState('')

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer('')
  }, [progress])

  const validateAnswer = () => {
    if (question.settings.data_type === 'integer') {
      const parsed = Number(answer)
      if (isNaN(parsed)) {
        setError('Answer must be an integer')
        return false
      } else if (!Number.isInteger(parsed)) {
        setError('Answer must be an integer')
        return false
      } else {
        setAnswer(parsed.toString())
        return true
      }
    }
  }

  const handleSubmit = () => {
    // Validate the answer format
    if (!validateAnswer()) return
    // Determine whether the answer is correct
    const ans = answer.toString()
    if (question.settings.feedback) {
      getSolution(question, answer, onSubmit)
    } else {
      for (const sol of question.solutions) {
        if (sol.toString() === ans) {
          onSubmit(answer, 'correct', '')
          return
        }
      }
      onSubmit(answer, 'incorrect', '')
    }
  }

  const handleChangeAnswer = (event) => {
    setAnswer(event.target.value)
    setError('')
  }

  if (progress.status === 'unanswered') {
    return (
      <div>
        <Description description={question.description} />
        <Form>
          <Form.Control
            value={answer}
            onChange={handleChangeAnswer}
          />
          <br />
          <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
          <br />
          {error !== '' && <Form.Text muted>{error}</Form.Text>}
        </Form>
      </div>
    )
  } else {
    return (
      <div>
        <Description description={question.description} />
        <Form>
          <Form.Control
            disabled
            readOnly
            value={answer}
          />
          <p className={progress.status === 'correct' ? 'text-correct' : 'text-incorrect'}>
            {progress.status === 'correct' ? 'Correct!' : 'Incorrect.'}
          </p>
          <p className='feedback'>
            {progress.feedback}
          </p>
          <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
        </Form>
      </div>
    )
  }
}
