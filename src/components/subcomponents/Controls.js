import React from 'react'

function Control (props) {
  return (
    <form>
      <label>{props.control.title}</label>
      <select>
        {props.actions.filter(option => !option.positional || props.control.positional)
          .map(option => {
            return (<option key={option.action}>{option.action}</option>)
          })}
      </select>
    </form>
  )
}

function Controls (props) {
  return (
    <div>
      {props.controls.map((item) => {
        return (<Control key={item.title} control={item} actions={props.actions}/>)
      })}
    </div>
  )
}

export default Controls