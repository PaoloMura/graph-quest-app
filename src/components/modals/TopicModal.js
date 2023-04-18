import React, { useEffect, useState } from 'react'
import { Modal, ModalBody, ModalHeader, ModalTitle, Table } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import BottomRow from '../helpers/BottomRow'
import axios from 'axios'
import TableRow from '../helpers/TableRow'

export default function TopicModal ({
  showModal,
  closeModal,
  token,
  setToken,
  topicCode,
  files,
  addTopic
}) {
  function setInitialData () {
    return {
      name: '',
      description: '',
      settings: {
        linear: true,
        feedback: 'none'
      },
      questions: []
    }
  }

  function setInitialErr () {
    return {
      name: '',
      description: '',
      settings: '',
      questions: '',
      submit: ''
    }
  }

  const [data, setData] = useState(setInitialData)
  const [err, setErr] = useState(setInitialErr)

  useEffect(() => {
    if (topicCode !== '0') {
      axios({
        method: 'GET',
        url: '/api/teacher/topics/' + topicCode,
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).then((response) => {
        // Update the token if necessary
        const res = response.data
        res.access_token && setToken(res.access_token)
        // Set the retrieved content with an additional index for questions
        setData({
          ...res,
          questions: res.questions.map((q, i) => {
            return { file: q.file, class: q.class, index: i }
          })
        })
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
    }
    return () => { setData(setInitialData) }
  }, [token, setToken, topicCode])

  const addQuestion = () => {
    const index = data.questions.length > 0 ? data.questions.at(-1).index + 1 : 0
    setData({
      ...data,
      questions: [
        ...data.questions,
        { file: files[0].file, class: files[0].questions[0], index }
      ]
    })
    setErr({ ...err, questions: '' })
  }

  const removeQuestion = (index, e) => {
    setData({
      ...data,
      questions: data.questions.filter(q => q.index !== index)
    })
  }

  const setName = (e) => {
    setData({
      ...data,
      name: e.target.value
    })
    setErr({ ...err, name: '' })
  }

  const setDescription = (e) => {
    setData({
      ...data,
      description: e.target.value
    })
  }

  const setFile = (index, e) => {
    setData({
      ...data,
      questions: data.questions.map(q => {
        if (q.index === index) return { file: e.target.value, class: q.class, index }
        else return q
      })
    })
  }

  const setClass = (index, e) => {
    setData({
      ...data,
      questions: data.questions.map(q => {
        if (q.index === index) return { file: q.file, class: e.target.value, index }
        else return q
      })
    })
  }

  const setLinear = () => {
    setData({
      ...data,
      settings: {
        ...data.settings,
        linear: !data.settings.linear
      }
    })
  }

  const setFeedback = (e) => {
    setData({
      ...data,
      settings: {
        ...data.settings,
        feedback: e.target.value
      }
    })
  }

  const validateForm = () => {
    let valid = true
    if (data.name === '') {
      setErr({ ...err, name: 'Title must not be empty' })
      valid = false
    }
    if (data.questions.length === 0) {
      setErr({ ...err, questions: 'Topic must have at least one question' })
      valid = false
    }
    return valid
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return
    const newData = {
      ...data,
      questions: data.questions.map(q => ({ file: q.file, class: q.class }))
    }
    const jsonData = JSON.stringify(newData)
    axios({
      method: 'PUT',
      url: '/api/teacher/topics/' + topicCode,
      data: jsonData,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      // Update the access token if necessary
      const res = response.data
      res.access_token && setToken(res.access_token)
      // Close the modal and add the topic to the list if necessary
      closeModal()
      addTopic(res, data.name)
    }).catch((error) => {
      if (error.response) {
        setErr({ ...err, submit: error.response.data })
      }
    })
  }

  return (
    <Modal show={showModal} onHide={closeModal} backdrop='static' centered size='lg'>
      <ModalHeader>
        <ModalTitle>
          {(topicCode !== '0') ? <h1>Edit Topic</h1> : <h1>New Topic</h1>}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} controlId='formTitle' className='mb-3'>
            <Form.Label column sm={3}>Title</Form.Label>
            <Col sm={9}>
              <Form.Control value={data.name} onChange={setName} />
            </Col>
            {err.name !== '' && <Form.Text muted>{err.name}</Form.Text>}
          </Form.Group>
          <Form.Group as={Row} controlId='formDescription' className='mb-3'>
            <Form.Label column sm={3}>Description</Form.Label>
            <Col sm={9}>
              <Form.Control as='textarea' rows={3} value={data.description} onChange={setDescription} />
            </Col>
          </Form.Group>
          <h3>Settings</h3>
          <Form.Group as={Row} controlId='formLinearSetting' className='mb-3'>
            <Form.Label column sm={3}>Linear progression</Form.Label>
            <Col sm={9}>
              <Form.Check type='checkbox' checked={data.settings.linear} onChange={setLinear} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId='formFeedbackSetting' className='mb-3'>
            <Form.Label column sm={3}>Feedback</Form.Label>
            <Col sm={9}>
              <Form.Select value={data.settings.feedback} onChange={setFeedback}>
                <option value='none'>None</option>
                <option value='each'>After each question</option>
                <option value='end'>At the end</option>
              </Form.Select>
            </Col>
          </Form.Group>
          <h3>Questions</h3>
          {err.questions !== '' && <Form.Text muted>{err.questions}</Form.Text>}
          <Table bordered hover>
            <tbody>
              {data.questions.map((question, index) => (
                <TableRow
                  key={question.index}
                  myKey={question.index}
                  selectedFile={question.file}
                  files={files.map((f) => (f.file))}
                  onChangeFile={setFile}
                  selectedClass={question.class}
                  classes={files.find(f => (f.file === question.file)).questions}
                  onChangeClass={setClass}
                  onDelete={removeQuestion}
                />
              ))}
              <BottomRow colSpan={3} onClick={addQuestion} />
            </tbody>
          </Table>
          <Form.Group as={Row} controlId='formSubmit' className='mb-3'>
            <Col className='d-grid gap-2'>
              <Button variant='secondary' size='lg' onClick={closeModal}>Cancel</Button>
            </Col>
            <Col className='d-grid gap-2'>
              <Button variant='primary' size='lg' type='submit'>Submit</Button>
            </Col>
            {err.submit !== '' && <Form.Text muted>{err.submit}</Form.Text>}
          </Form.Group>
        </Form>
      </ModalBody>
    </Modal>
  )
}
