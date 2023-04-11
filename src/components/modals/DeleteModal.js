import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import React from 'react'

export default function DeleteModal ({ deleting, closeDelete, performDelete }) {
  return (
    <Modal show={deleting} onHide={closeDelete}>
      <ModalHeader>
        <ModalTitle>Delete</ModalTitle>
      </ModalHeader>
      <ModalBody>
        Are you sure?
      </ModalBody>
      <ModalFooter>
        <Button variant={'secondary'} onClick={closeDelete}>
          Cancel
        </Button>
        <Button variant={'primary'} onClick={performDelete}>Yes</Button>
      </ModalFooter>
    </Modal>
  )
}