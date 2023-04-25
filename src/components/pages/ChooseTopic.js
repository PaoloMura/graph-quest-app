import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Header from '../helpers/Header'
import { useNavigate } from 'react-router-dom'

function ChooseTopic () {
  const [topicCode, setTopicCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/student/topics/' + topicCode)
  }

  const updateCode = (e) => setTopicCode(e.target.value)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <div>
      <Header btnType='back' backPath='/' />
      <Form onSubmit={handleSubmit} className='login-box d-grid gap-2'>
        <h2>Choose a Topic</h2>
        <Form.Group className='Login-row'>
          <Form.Control
            placeholder='Topic code'
            value={topicCode}
            onChange={updateCode}
            onKeyDown={handleKeyDown}
          />
        </Form.Group>
        <Button variant='primary' className='lg' type='submit'>Submit</Button>
      </Form>
    </div>
  )
}

export default ChooseTopic
