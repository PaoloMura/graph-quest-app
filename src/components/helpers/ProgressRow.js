import React, { useState } from 'react'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Question from './Question'
import FinishedModal from '../modals/FinishedModal'

export default function ProgressRow ({ topicName, settings, questions }) {
  const setInitialAnswers = () => new Array(questions.length).fill(
    {
      answer: undefined,
      status: 'unanswered'
    })

  const [selected, setSelected] = useState(0)
  const [progress, setProgress] = useState(setInitialAnswers)
  const [showFinished, setShowFinished] = useState(false)

  const inProgress = progress.some(item => item.status === 'unanswered')
  const disabledManualNav = settings['linear'] && inProgress

  const onSelect = (k) => {
    if (!disabledManualNav) {
      setSelected(parseInt(k))
    }
  }

  const handleSubmit = (answer, status, feedback) => {
    setProgress(progress.map((item, index) => {
      return index === selected ? { answer: answer, status: status, feedback: feedback } : item
    }))
    if (settings['feedback'] !== 'each') handleNext()
  }

  const handleNext = () => {
    if (inProgress) {
      let i = selected
      if (settings['feedback'] !== 'each') i++
      while (progress[i]['status'] !== 'unanswered') {
        i = (i + 1 >= progress.length) ? 0 : i + 1
      }
      setSelected(i)
    } else {
      setShowFinished(true)
    }
  }

  const getTabClassName = (status) => {
    if (settings['feedback'] === 'each' ||
      (settings['feedback'] === 'end' && !inProgress)) {
      return 'tab-' + status
    }
    return ''
  }

  const handleCloseFinished = () => {
    if (settings['feedback'] === 'none') return
    setShowFinished(false)
  }

  let submitStatus
  if (inProgress) {
    if (progress[selected]['status'] === 'unanswered') {
      submitStatus = 'submit'
    } else {
      submitStatus = 'next'
    }
  } else {
    submitStatus = 'finish'
  }

  return (
    <div>
      <h1>Topic: {topicName}</h1>
      <Tabs justify activeKey={selected} onSelect={onSelect}>
        {progress.map((item, index) => (
            <Tab
              key={index}
              eventKey={index}
              title={'Question ' + (index + 1)}
              disabled={disabledManualNav}
              mountOnEnter
              unmountOnExit
              tabClassName={getTabClassName(item['status'])}
            >
              <br/>
              <Question
                question={questions[index]}
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