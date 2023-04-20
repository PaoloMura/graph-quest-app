import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import React from 'react'

export default function ErrorModal ({ showError, onHideError, errorMessage }) {
  return (
    <Modal show={showError} onHide={onHideError}>
      <ModalHeader>
        <ModalTitle>Error</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {errorMessage}
      </ModalBody>
      <ModalFooter>
        <Button variant='primary' onClick={onHideError}>Ok</Button>
      </ModalFooter>
    </Modal>
  )
}
