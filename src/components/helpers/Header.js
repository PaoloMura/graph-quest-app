import React from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import logo from '../../data/images/logo.png'
import Stack from 'react-bootstrap/Stack'

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
      <Stack direction='horizontal' gap={3}>
        {
          btnType === 'logout' &&
            <Button variant='secondary' size='lg' onClick={logMeOut} id='btn-logout'>Logout</Button>
        }
        {
          btnType === 'back' &&
            <Button variant='secondary' size='lg' href={backPath} id='btn-logout'>Back</Button>
        }
        {
          btnType === 'exit' &&
            <Button variant='secondary' size='lg' href={backPath} id='btn-logout'>Exit</Button>
        }
        <Image src={logo} alt='Graph Quest' fluid className='logo' />
      </Stack>
    </div>
  )
}

export default Header
