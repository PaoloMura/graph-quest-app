import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ProgressRow from '../helpers/ProgressRow'
import Header from '../helpers/Header'
import NotFound from '../helpers/NotFound'

function Student () {
  const { topic_code } = useParams()

  const setInitialData = () => {
    return {
      name: '',
      description: '',
      settings: {},
      questions: []
    }
  }

  const [data, setData] = useState(setInitialData)
  const [err, setErr] = useState(true)

  const handleUpdateData = (idx, newData) => {
    setData({
      ...data,
      questions: data.questions.map(
        (q, i) => (i !== idx)
          ? q
          : {
              ...q,
              settings: {
                ...q.settings,
                highlighted_nodes: newData.highlighted_nodes,
                highlighted_edges: newData.highlighted_edges
              }
            }
      )
    })
  }

  useEffect(() => {
    axios({
      method: 'GET',
      url: '/api/student/topics/' + topic_code
    }).then((response) => {
      const res = response.data
      setData(res)
      setErr(false)
    }).catch((error) => {
      if (error.response) {
        setErr(true)
        console.log(error.response)
      }
    })
    return () => { setData(setInitialData) }
  }, [topic_code])

  return (
    <div>
      <Header btnType='exit' backPath='/student/portal' />
      <div className='topic-area'>
        {
          err
            ? <NotFound />
            : <ProgressRow
                topicName={data.name}
                settings={data.settings}
                questions={data.questions}
                onUpdateData={handleUpdateData}
              />
        }
      </div>
    </div>
  )
}

export default Student
