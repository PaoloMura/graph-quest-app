import React from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Graph from './Graph'
import ASelectPath from '../answers/ASelectPath'
import ATextInput from '../answers/ATextInput'
import AVertexSet from '../answers/AVertexSet'
import AMultipleChoice from '../answers/AMultipleChoice'
import settings from '../../data/settings.json'
import AEdgeSet from '../answers/AEdgeSet'

export default function Question ({ question, setQuestion, myIndex, progress, onSubmit, onNext, submitStatus }) {
  const onSetQuestion = (data) => {
    setQuestion(myIndex, data)
  }

  const props = { question, onSetQuestion, progress, onSubmit, onNext, submitStatus }

  const answerComponents = {
    QSelectPath: <ASelectPath {...props} />,
    QVertexSet: <AVertexSet {...props} />,
    QTextInput: <ATextInput {...props} />,
    QMultipleChoice: <AMultipleChoice {...props} />,
    QEdgeSet: <AEdgeSet {...props} />
  }

  return (
    <div>
      <Container>
        <Row>
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
          </Col>
          <Col className='answer-area'>
            {answerComponents[question.type]}
          </Col>
        </Row>
      </Container>
    </div>
  )
}
