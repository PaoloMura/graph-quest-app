import React from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'

function Header ({ btnType, backPath, removeToken }) {
  function logMeOut () {
    axios({
      method: 'POST',
      url: '/api/logout'
    }).then((response) => {
      removeToken()
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  return (
    <div id='header'>
      <h1>Graph Quest</h1>
      {
        btnType === 'logout' &&
          <Button variant='secondary' onClick={logMeOut} id='btn-logout'>Logout</Button>
      }
      {
        btnType === 'back' &&
          <Button variant='secondary' href={backPath} id='btn-logout'>Back</Button>
      }
      {
        btnType === 'exit' &&
          <Button variant='secondary' href={backPath} id='btn-logout'>Exit</Button>
      }
    </div>
  )
}

export default Header
