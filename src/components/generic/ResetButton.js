import React from 'react'
import Button from 'react-bootstrap/Button'

export default function ResetButton ({ onReset }) {
  return (
    <div className='d-grid gap-2 reset-button'>
      <Button size='lg' variant='secondary' onClick={onReset}>Reset</Button>
    </div>
  )
}
