import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ChooseTopic from './components/pages/ChooseTopic'
import Home from './components/pages/Home'
import TeacherLogin from './components/pages/TeacherLogin'
import useToken from './components/hooks/useToken'
import Teacher from './components/pages/Teacher'
import Student from './components/pages/Student'

function App () {
  const { token, removeToken, setToken } = useToken()

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/teacher" element={
            !token && token !== '' && token !== undefined ?
              <TeacherLogin setToken={setToken}/> :
              <Teacher
                token={token}
                removeToken={removeToken}
                setToken={setToken}
              />
          }/>
          <Route path="/student/portal" element={<ChooseTopic/>}/>
          <Route path="/student/topics/:topic_code" element={<Student/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
