import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ProgressRow from '../subcomponents/ProgressRow'
import Header from '../subcomponents/Header'
import NotFound from './NotFound'

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
  const [err, setErr] = useState('')

  useEffect(() => {
    axios({
      method: 'GET',
      url: '/api/student/topics/' + topic_code
    }).then((response) => {
      const res = response.data
      setData(res)
      setErr('')
    }).catch((error) => {
      if (error.response) {
        setErr(error.response.data)
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
            ? <NotFound error={err} />
            : <ProgressRow
                topicName={data.name}
                settings={data.settings}
                questions={data.questions}
              />
        }
      </div>
    </div>
  )
}

export default Student
