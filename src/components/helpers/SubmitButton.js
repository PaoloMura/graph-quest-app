import React from 'react'
import Button from 'react-bootstrap/Button'

export default function SubmitButton ({ onSubmit, onNext, submitStatus }) {
  let text
  let onClick
  switch (submitStatus) {
    case 'submit':
      text = 'Submit'
      onClick = onSubmit
      break
    case 'next':
      text = 'Next'
      onClick = onNext
      break
    case 'finish':
      text = 'Finish'
      onClick = onNext
      break
    default:
      console.log('Invalid submit status')
  }

  return (
    <div className="d-grid gap-2">
      <Button
        variant="primary"
        size="md"
        onClick={onClick}
      >
        {text}
      </Button>
    </div>
  )
}