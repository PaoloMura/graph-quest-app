import React, { useEffect, useState } from 'react'
import Description from './Description'
import Form from 'react-bootstrap/Form'
import SubmitButton from '../generic/SubmitButton'
import ResetButton from '../generic/ResetButton'
import { triggerGraphEvent } from '../utilities/graph-events'
import axios from 'axios'

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

  function getFeedback () {
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
      onSubmit(answer, status, res.feedback)
      data = {
        highlighted_nodes: res.highlighted_nodes,
        highlighted_edges: res.highlighted_edges
      }
      setTimeout(() => { updateData(data) }, 300)
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        setError(error.response.data)
      }
    })
  }

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
