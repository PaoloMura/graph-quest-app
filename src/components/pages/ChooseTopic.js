import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Header from '../helpers/Header'

function ChooseTopic () {
  const [topicCode, setTopicCode] = useState('')

  const updateCode = (e) => setTopicCode(e.target.value)

  return (
    <div>
      <Header btnType="back" backPath="/"/>
      <Form className="Login-box d-grid gap-2">
        <h2>Choose a Topic</h2>
        <Form.Group className={'Login-row'}>
          <Form.Control placeholder={'Topic code'} value={topicCode} onChange={updateCode}></Form.Control>
        </Form.Group>
        <Button variant="primary" className="lg" href={'/student/topics/' + topicCode}>Submit</Button>
      </Form>
    </div>
  )
}

export default ChooseTopic