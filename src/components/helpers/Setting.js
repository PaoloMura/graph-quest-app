import React from 'react'

function Setting (props) {
  return (
    <form>
      <label>{props.setting}</label>
      <select>
        {props.options.map((option) => {
          return (<option key={option}>{option}</option>)
        })}
      </select>
    </form>
  )
}

function Settings (props) {
  return (
    <div>
      {props.settings.map((item) => {
        return (<Setting
          key={item.setting}
          setting={item.setting}
          options={item.options}
        />)
      })}
    </div>
  )
}

export default Settings