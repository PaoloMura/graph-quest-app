import React, { useEffect, useRef, useState } from 'react'
import * as constants from '../utilities/constants'
import { Modal, ModalBody, ModalHeader, ModalTitle, Overlay } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import IconButton from '@mui/material/IconButton'
import Tooltip from 'react-bootstrap/Tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard/src'

function ShareRow ({ label, value }) {
  const [show, setShow] = useState(false)
  const target = useRef(null)

  // This hides the tooltip after 2 second of visibility
  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShow(false)
      }, 2000)
    }
  }, [show])

  return (
    <Row>
      <Col xs={2}>{label}</Col>
      <Col xs={8}>{value}</Col>
      <Col xs={2}>
        <CopyToClipboard text={value} onCopy={() => setShow(true)}>
          <IconButton ref={target}>
            <ContentCopyIcon/>
          </IconButton>
        </CopyToClipboard>
        <Overlay target={target.current} show={show} placement="top">
          <Tooltip id="copied-tooltip">Copied to clipboard</Tooltip>
        </Overlay>
      </Col>
    </Row>
  )
}

export default function CodeModal ({ showModal, closeModal, topicCode }) {
  return (
    <Modal show={showModal} onHide={closeModal} size="lg">
      <ModalHeader>
        <ModalTitle>Share Topic</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Container>
          <ShareRow label="Topic code" value={topicCode}/>
          <br/>
          <ShareRow label="URL" value={constants.URL + '/student/topics/' + topicCode}/>
        </Container>
      </ModalBody>
    </Modal>
  )
}