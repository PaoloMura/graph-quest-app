import React from 'react'
import Button from 'react-bootstrap/Button'
import Stack from 'react-bootstrap/Stack'
import Header from '../helpers/Header'

function Home () {
  return (
    <div>
      <Header/>
      <div className={'Home-box'}>
        <Stack gap={5}>
          <Button href={'/teacher'}>Teacher</Button>
          <Button href={'/student/portal'}>Student</Button>
        </Stack>
      </div>
    </div>
  )
}

export default Home
