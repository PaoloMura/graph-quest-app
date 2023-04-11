import React from 'react'
import Button from 'react-bootstrap/Button'

export default function Solution ({ success, message, onSubmit }) {
  return (
    <>
      {success ? <p>Correct!</p> : <p>Incorrect</p>}
      {message && <p>{message}</p>}
      <br/>
      <Button variant={'primary'} onClick={onSubmit}>Next</Button>
    </>
  )
}