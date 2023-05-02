import React, { useEffect, useState } from 'react'
import { getFeedback } from '../utilities/http'
import Description from './Description'
import Form from 'react-bootstrap/Form'
import SubmitButton from '../generic/SubmitButton'
import ResetButton from '../generic/ResetButton'

export default function QuestionPanel ({
  question,
  progress,
  onSubmit,
  onNext,
  submitStatus,
  initialAnswer,
  controls,
  validate,
  verify,
  onReset,
  Answer,
  DisabledAnswer
}) {
  const [answer, setAnswer] = useState(initialAnswer(question))
  const [error, setError] = useState('')

  useEffect(() => {
    if (progress.answer !== undefined) setAnswer(progress.answer)
    else setAnswer(initialAnswer(question))
  }, [progress, initialAnswer, question])

  const handleSubmit = (event) => {
    event.preventDefault()
    setError(validate(question, answer))
    if (error) return
    if (question.settings.feedback) {
      getFeedback(question, answer, onSubmit)
    } else {
      const correct = verify(question, answer) ? 'correct' : 'incorrect'
      onSubmit(answer, correct, '')
    }
  }

  const handleReset = () => {
    onReset(question, answer)
    setAnswer(initialAnswer(question))
    setError('')
  }

  const unanswered = progress.status === 'unanswered'
  const correct = progress.status === 'correct'

  const unansweredBlock = (
    <>
      <Description description={question.description} controls={controls(question)} />
      <Answer
        question={question}
        answer={answer}
        progress={progress}
        setAnswer={setAnswer}
        setError={setError}
      />
      {error && <Form.Text className='text-danger' muted={false}>{error}</Form.Text>}
      <ResetButton onReset={handleReset} />
    </>
  )

  const answeredBlock = (
    <>
      <Description description={question.description} />
      <DisabledAnswer
        question={question}
        answer={answer}
        progress={progress}
      />
      <p className={correct ? 'text-correct' : 'text-incorrect'}>
        {correct ? 'Correct!' : 'Incorrect.'}
      </p>
      <p className='feedback'>
        {progress.feedback}
      </p>
    </>
  )

  return (
    <div>
      <Form>
        {unanswered ? unansweredBlock : answeredBlock}
        <SubmitButton onSubmit={handleSubmit} onNext={onNext} submitStatus={submitStatus} />
      </Form>
    </div>
  )
}
