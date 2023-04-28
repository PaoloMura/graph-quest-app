import React, { useEffect, useState } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Question from './Question'
import FinishedModal from '../modals/FinishedModal'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function ProgressRow ({ topicName, settings, questions, onUpdateData }) {
  const setInitialAnswers = (qs) => new Array(qs.length).fill(
    {
      answer: undefined,
      status: 'unanswered'
    })

  const [selected, setSelected] = useState(0)
  const [progress, setProgress] = useState(setInitialAnswers(questions))
  const [showFinished, setShowFinished] = useState(false)

  useEffect(() => {
    setProgress(setInitialAnswers(questions))
    return () => {
      setProgress(setInitialAnswers(questions))
    }
  }, [questions])

  const inProgress = progress.some(item => item.status === 'unanswered')
  const disabledManualNav = settings.linear && inProgress

  const onSelect = (k) => {
    if (!disabledManualNav) {
      setSelected(parseInt(k))
    }
  }

  const handleSubmit = (answer, status, feedback) => {
    setProgress(progress.map((item, index) => {
      return index === selected ? { answer, status, feedback } : item
    }))
    if (settings.feedback !== 'each') handleNext()
  }

  const handleNext = () => {
    if (inProgress) {
      let i = selected
      if (settings.feedback !== 'each') i++
      while (progress[i].status !== 'unanswered') {
        i = (i + 1 >= progress.length) ? 0 : i + 1
      }
      setSelected(i)
    } else {
      setShowFinished(true)
    }
  }

  const getTabStatus = (status) => {
    if (settings.feedback === 'each' ||
      (settings.feedback === 'end' && !inProgress)) {
      return status
    }
    return ''
  }

  const getTabClassName = (status) => {
    const name = getTabStatus(status)
    if (name !== '') return 'tab-' + name
    else return ''
  }

  const handleCloseFinished = () => {
    if (settings.feedback === 'none') return
    setShowFinished(false)
  }

  let submitStatus
  if (inProgress) {
    if (progress[selected].status === 'unanswered') {
      submitStatus = 'submit'
    } else {
      submitStatus = 'next'
    }
  } else {
    submitStatus = 'finish'
  }

  const getTabIcon = (status) => {
    const name = getTabStatus(status)
    switch (name) {
      case 'correct':
        return <CheckIcon />
      case 'incorrect':
        return <ClearIcon />
      default:
        return <CheckBoxOutlineBlankIcon />
    }
  }

  const getTabTitle = (number, status) => {
    return (
      <Container>
        <Row>
          <Col xs={6}>
            <div>{'Q' + number}</div>
          </Col>
          <Col>
            {getTabIcon(status)}
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <div>
      <h1>Topic: {topicName}</h1>
      <Tabs justify activeKey={selected} onSelect={onSelect}>
        {progress.map((item, index) => (
          <Tab
            key={index}
            eventKey={index}
            title={getTabTitle(index + 1, item.status)}
            disabled={disabledManualNav}
            mountOnEnter
            unmountOnExit
            tabClassName={getTabClassName(item.status)}
          >
            <br />
            <Question
              question={questions[index]}
              setQuestion={onUpdateData}
              myIndex={index}
              progress={progress[index]}
              onSubmit={handleSubmit}
              onNext={handleNext}
              submitStatus={submitStatus}
            />
          </Tab>
        )
        )}
      </Tabs>
      {
        showFinished &&
          <FinishedModal
            showModal={showFinished}
            onClose={handleCloseFinished}
            progress={progress}
            settings={settings}
          />
      }
    </div>
  )
}
