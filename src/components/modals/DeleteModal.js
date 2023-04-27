import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export default function DeleteModal ({ deleting, closeDelete, performDelete, error }) {
  return (
    <Modal show={deleting} onHide={closeDelete}>
      <ModalHeader>
        <ModalTitle>Delete</ModalTitle>
      </ModalHeader>
      <ModalBody>
        Are you sure?
      </ModalBody>
      <ModalFooter>
        {(error !== '') && <Form.Text muted>{error}</Form.Text>}
        <Button variant='secondary' onClick={closeDelete}>Cancel</Button>
        <Button variant='primary' onClick={performDelete}>Yes</Button>
      </ModalFooter>
    </Modal>
  )
}
