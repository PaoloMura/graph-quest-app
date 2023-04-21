import React from 'react'
import { Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function FinishedModal ({ showModal, onClose, progress, settings }) {
  const score = progress.reduce((tot, cur) => {
    return cur.status === 'correct' ? tot + 1 : tot
  }, 0)
  const total = progress.length

  return (
    <Modal
      show={showModal}
      onHide={onClose}
    >
      <ModalHeader>
        <ModalTitle>Topic complete</ModalTitle>
      </ModalHeader>
      <ModalBody>
        You scored {score} out of {total}.
        <br />
        <ul>
          {
            progress.map((item, idx) => (
              <li key={idx}>Q{idx + 1}: {item.status}</li>
            ))
          }
        </ul>
        <Container>
          <Row>
            {
              settings.feedback !== 'none' &&
                <Col>
                  <Button variant='primary' onClick={onClose}>Return to answers</Button>
                </Col>
            }
            <Col>
              <Button variant='primary' href='/student/portal'>Return to student portal</Button>
            </Col>
          </Row>
        </Container>
      </ModalBody>
    </Modal>
  )
}
