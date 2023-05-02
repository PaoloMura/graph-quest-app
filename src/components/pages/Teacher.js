import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Table } from 'react-bootstrap'
import { TblButton, TblText } from '../generic/TableRow'
import BottomRow from '../generic/BottomRow'
import DeleteModal from '../modals/DeleteModal'
import FileUploadModal from '../modals/FileUploadModal'
import TopicModal from '../modals/TopicModal'
import CodeModal from '../modals/CodeModal'
import Header from '../subcomponents/Header'
import ErrorModal from '../modals/ErrorModal'

function Teacher ({ token, removeToken, setToken }) {
  function setInitialContent () {
    return {
      files: [],
      topics: []
    }
  }

  const [content, setContent] = useState(setInitialContent)
  const [delFile, setDelFile] = useState('')
  const [delFileError, setDelFileError] = useState('')
  const [delTopic, setDelTopic] = useState('')
  const [delTopicError, setDelTopicError] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showTopic, setShowTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedCode, setSelectedCode] = useState('0')
  const [error, setError] = useState('')

  const getContent = useCallback(() => {
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
        files: res.files,
        topics: res.topics
      }))
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
      }
    })
  }, [token, setToken])

  const handleCloseError = () => {
    setError('')
  }

  const handleDownloadFile = (item) => {
    // Download the file from the server
    axios({
      method: 'GET',
      url: '/api/teacher/questions/' + item,
      headers: {
        Authorization: 'Bearer ' + token
      },
      responseType: 'blob'
    }).then((response) => {
      // Update the access token if necessary
      const res = response.data
      res.access_token && setToken(res.access_token)
      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', item)
      document.body.appendChild(link)
      link.click()
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        setError(`Couldn't download file: ${error.response.status} - ${error.response.statusText}`)
      }
    })
  }

  const handleOpenDelFile = (item) => {
    setDelFile(item)
    setDelFileError('')
  }
  const handleCloseDelFile = () => {
    setDelFile('')
    setDelFileError('')
  }
  const handleDelFile = () => {
    setDelFileError('')
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
        files: content.files.filter(f => f.file !== delFile)
      })
      setDelFile('')
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        setDelFileError(error.response.data)
      }
    })
  }

  const handleOpenDelTopic = (item) => {
    setDelTopic(item)
    setDelTopicError('')
  }
  const handleCloseDelTopic = () => {
    setDelTopic('')
    setDelTopicError('')
  }
  const handleDelTopic = () => {
    setDelTopicError('')
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
        setDelTopicError(error.response.data)
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
    else if (content.files.some((f) => (f.file === file.name))) reason = 'File with this name already uploaded'
    // Return the result
    const valid = reason === ''
    return { valid, reason }
  }
  const addFile = (filename) => {
    getContent()
  }

  const handleSelectTopic = (topicCode) => setSelectedTopic(topicCode)
  const handleNewTopic = () => setShowTopic(true)
  const handleCloseTopic = () => {
    setSelectedTopic('')
    setShowTopic(false)
  }
  const addTopic = (topicCode, topicName) => {
    // Either edit an existing topic
    for (const topic of content.topics) {
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
    console.log('use effect')
    getContent()
  }, [getContent])

  return (
    <div>
      <Header btnType='logout' removeToken={removeToken} />
      <Container>
        <Row>
          <Col>
            <h2>Questions:</h2>
            <Table bordered hover>
              <tbody>
                {content.files.map((f) => (
                  <tr key={f.file}>
                    <TblText text={f.file} />
                    <TblButton
                      myKey={f.file}
                      icon='download'
                      onClick={handleDownloadFile}
                    />
                    <TblButton
                      myKey={f.file}
                      icon='delete'
                      onClick={handleOpenDelFile}
                    />
                  </tr>
                ))}
                <BottomRow colSpan={3} onClick={handleOpenFileUpload} />
              </tbody>
            </Table>
          </Col>
          <Col>
            <h2>Topics:</h2>
            <Table bordered hover>
              <tbody>
                {content.topics.map((topic) => (
                  <tr key={topic.topic_code}>
                    <TblText myKey={topic.topic_code} text={topic.name} onClick={handleSelectTopic} />
                    <TblButton myKey={topic.topic_code} icon='share' onClick={setSelectedCode} />
                    <TblButton myKey={topic.topic_code} icon='delete' onClick={handleOpenDelTopic} />
                  </tr>
                ))}
                <BottomRow colSpan={3} onClick={handleNewTopic} />
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <DeleteModal
        deleting={delFile}
        closeDelete={handleCloseDelFile}
        performDelete={handleDelFile}
        error={delFileError}
      />
      <DeleteModal
        deleting={delTopic}
        closeDelete={handleCloseDelTopic}
        performDelete={handleDelTopic}
        error={delTopicError}
      />
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
        files={content.files}
        addTopic={addTopic}
      />
      <CodeModal
        showModal={selectedCode !== '0'}
        closeModal={handleCloseCode}
        topicCode={selectedCode}
      />
      <ErrorModal
        showError={error !== ''}
        onHideError={handleCloseError}
        errorMessage={error}
      />
    </div>
  )
}

export default Teacher
