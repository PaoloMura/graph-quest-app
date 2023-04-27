import React, { useState } from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Header from '../subcomponents/Header'

function TeacherLogin ({ setToken }) {
  const [loginForm, setloginForm] = useState({
    username: '',
    password: ''
  })

  function logMeIn (event) {
    axios({
      method: 'POST',
      url: '/api/token',
      data: {
        username: loginForm.username,
        password: loginForm.password
      }
    })
      .then((response) => {
        setToken(response.data.access_token)
      }).catch((error) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.headers)
        }
      })
  }

  function handleChange (event) {
    const { value, name } = event.target
    setloginForm(prevNote => ({
      ...prevNote, [name]: value
    }))
  }

  return (
    <div>
      <Header btnType='back' backPath='/' />
      <Form className='login-box'>
        <h2>Teacher Login</h2>
        <Form.Control
          className='Login-row'
          onChange={handleChange}
          placeholder='Username'
          text={loginForm.username}
          value={loginForm.username}
          name='username'
        />
        <Form.Control
          className='Login-row'
          type='password'
          onChange={handleChange}
          placeholder='Password'
          text={loginForm.password}
          value={loginForm.password}
          name='password'
        />
        <Button variant='primary' onClick={logMeIn} className='Login-row'>Login</Button>
      </Form>
    </div>
  )
}

export default TeacherLogin
