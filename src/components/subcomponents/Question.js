import React, { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Graph from './Graph'
import settings from '../../data/settings.json'
import Loading from '../pages/Loading'
import QuestionPanel from './QuestionPanel'

export default function Question ({ question, progress, onSubmit, onNext, submitStatus }) {
  let answerClass = 'answer-area'
  if (question.graphs.length > 0) answerClass += ' answer-margin'

  const [props, setProps] = useState(null)

  useEffect(() => {
    import('../answers/A' + question.type.slice(1) + '.js').then((module) => {
      const initialAnswer = module.initialAnswer
      const controls = module.controls
      const validate = module.validate
      const verify = module.verify
      const onReset = module.onReset
      const Answer = module.Answer
      const DisabledAnswer = module.DisabledAnswer

      setProps({
        initialAnswer,
        controls,
        validate,
        verify,
        onReset,
        Answer,
        DisabledAnswer
      })
    }).catch((error) => {
      console.log(error)
    })
  }, [question])

  if (props == null) {
    return <Loading />
  } else {
    const fullProps = { question, progress, onSubmit, onNext, submitStatus, ...props }
    return (
      <div className='question-area'>
        <Row>
          {question.graphs.length > 0 &&
            <Col xs={12} md={7}>
              <Row className='Graph-area'>
                {
                    question.graphs.map((graph, idx) => (
                      <Col key={idx}>
                        <h2>G{idx + 1}</h2>
                        <Graph
                          myKey={idx}
                          settings={settings[question.type]}
                          user_settings={question.settings}
                          data={graph}
                        />
                      </Col>
                    ))
                  }
              </Row>
            </Col>}
          <Col className={answerClass}>
            <QuestionPanel {...fullProps} />
          </Col>
        </Row>
      </div>
    )
  }
}
