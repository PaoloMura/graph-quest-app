import React, { useState } from 'react'
import { Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import axios from 'axios'

export default function FileUploadModal ({
  showModal,
  closeModal,
  token,
  setToken,
  validateFile,
  addFile
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (event) => {
    const { valid, reason } = validateFile(selectedFile)
    if (!valid) {
      setErrorMsg(reason)
      event.preventDefault()
      event.stopPropagation()
      return
    }
    event.preventDefault()
    const formData = new FormData()
    formData.append('file', selectedFile)
    axios({
      method: 'POST',
      url: '/api/teacher/questions/file',
      data: formData,
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).then((response) => {
      // Update the access token if necessary
      const res = response.data
      res.access_token && setToken(res.access_token)
      // Close the modal and add the file to the list
      closeModal()
      addFile(selectedFile.name)
    }).catch((error) => {
      if (error.response) {
        setErrorMsg(error.response.data)
      }
    })
  }

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0])
    setErrorMsg('')
  }

  return (
    <Modal show={showModal} onHide={closeModal}>
      <ModalHeader>
        <ModalTitle>Upload file</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId='formFileInput'>
            <Form.Control type='file' onChange={handleFileSelect} />
            {errorMsg && <Form.Text muted>{errorMsg}</Form.Text>}
          </Form.Group>
          <br />
          <Button
            variant='primary'
            type='submit'
            disabled={selectedFile === null || selectedFile === undefined}
          >
            Upload
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}
