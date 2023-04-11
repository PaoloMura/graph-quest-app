import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Table } from 'react-bootstrap'
import TableRow from '../helpers/TableRow'
import BottomRow from '../helpers/BottomRow'
import DeleteModal from '../modals/DeleteModal'
import FileUploadModal from '../modals/FileUploadModal'
import TopicModal from '../modals/TopicModal'
import CodeModal from '../modals/CodeModal'
import Header from '../helpers/Header'

function Teacher ({ token, removeToken, setToken }) {
  function setInitialContent () {
    return {
      questions: [],
      topics: []
    }
  }

  const [content, setContent] = useState(setInitialContent)
  const [delFile, setDelFile] = useState('')
  const [delTopic, setDelTopic] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showTopic, setShowTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedCode, setSelectedCode] = useState('0')

  const handleOpenDelFile = (item) => setDelFile(item)
  const handleCloseDelFile = () => setDelFile('')
  const handleDelFile = () => {
    // Delete the file from the server
    axios({
      method: 'DELETE',
      url: '/api/teacher/questions/' + delFile,
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then((response) => {
      // Update the access token if necessary
      const res = response.data
      res.access_token && setToken(res.access_token)
      // Remove the file from our local list
      setContent({
        ...content,
        questions: content.questions.filter(q => q !== delFile)
      })
      setDelFile('')
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  const handleOpenDelTopic = (item) => setDelTopic(item)
  const handleCloseDelTopic = () => setDelTopic('')
  const handleDelTopic = () => {
    // Delete the topic from the server
    axios({
      method: 'DELETE',
      url: '/api/teacher/topics/' + delTopic,
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then((response) => {
      // Update the access token if necessary
      const res = response.data
      res.access_token && setToken(res.access_token)
      // Remove the topic from our local list
      setContent({
        ...content,
        topics: content.topics.filter(t => t.topic_code !== delTopic)
      })
      setDelTopic('')
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  const handleOpenFileUpload = () => setShowFileUpload(true)
  const handleCloseFileUpload = () => setShowFileUpload(false)
  const validateFile = (file) => {
    // Check for errors
    let reason = ''
    if (file === undefined || file === null) reason = 'No file selected'
    else if (file.type !== 'text/x-python-script') reason = 'File type must be a Python script'
    else if (content.questions.includes(file.name)) reason = 'File with this name already uploaded'
    // Return the result
    let valid = reason === ''
    return { valid, reason }
  }
  const addFile = (filename) => {
    setContent({
      ...content,
      questions: [
        ...content.questions,
        filename
      ]
    })
  }

  const handleSelectTopic = (topicCode) => setSelectedTopic(topicCode)
  const handleNewTopic = () => setShowTopic(true)
  const handleCloseTopic = () => {
    setSelectedTopic('')
    setShowTopic(false)
  }
  const addTopic = (topicCode, topicName) => {
    // Either edit an existing topic
    for (let topic of content.topics) {
      if (topic.topic_code === topicCode) {
        topic.name = topicName
        return
      }
    }
    // Or add a new one
    setContent({
      ...content,
      topics: [
        ...content.topics,
        { topic_code: topicCode, name: topicName }
      ]
    })
  }

  const handleCloseCode = () => setSelectedCode('0')

  useEffect(() => {
    axios({
      method: 'GET',
      url: '/api/teacher/content',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then((response) => {
      const res = response.data
      res.access_token && setToken(res.access_token)
      setContent(({
        questions: res.questions,
        topics: res.topics
      }))
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }, [token, setToken])

  return (
    <div>
      <Header btnType="logout" removeToken={removeToken}/>
      <Container>
        <Row>
          <Col>
            <h2>Questions:</h2>
            <Table bordered hover>
              <tbody>
              {content.questions.map((question) => (
                <TableRow
                  key={question}
                  text={question}
                  myKey={question}
                  onDelete={handleOpenDelFile}
                />
              ))}
              <BottomRow colSpan={2} onClick={handleOpenFileUpload}/>
              </tbody>
            </Table>
          </Col>
          <Col>
            <h2>Topics:</h2>
            <Table bordered hover>
              <tbody>
              {content.topics.map((topic) => (
                <TableRow
                  key={topic.topic_code}
                  text={topic.name}
                  link={handleSelectTopic}
                  myKey={topic.topic_code}
                  share={setSelectedCode}
                  onDelete={handleOpenDelTopic}
                />
              ))}
              <BottomRow colSpan={3} onClick={handleNewTopic}/>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <DeleteModal deleting={delFile} closeDelete={handleCloseDelFile} performDelete={handleDelFile}/>
      <DeleteModal deleting={delTopic} closeDelete={handleCloseDelTopic} performDelete={handleDelTopic}/>
      <FileUploadModal
        showModal={showFileUpload}
        closeModal={handleCloseFileUpload}
        token={token}
        setToken={setToken}
        validateFile={validateFile}
        addFile={addFile}
      />
      <TopicModal
        showModal={selectedTopic !== '' || showTopic}
        closeModal={handleCloseTopic}
        token={token}
        setToken={setToken}
        topicCode={selectedTopic !== '' ? selectedTopic : '0'}
        files={content.questions}
        addTopic={addTopic}
      />
      <CodeModal
        showModal={selectedCode !== '0'}
        closeModal={handleCloseCode}
        topicCode={selectedCode}
      />
    </div>
  )
}

export default Teacher