import React from 'react'

function Control ({ control, actions }) {
  return (
    <form>
      <label>{control.title}</label>
      <select>
        {
          actions.filter(option => !option.positional || control.positional)
            .map(option => {
              return (
                <option key={option.action}>
                  {option.action}
                </option>
              )
            })
        }
      </select>
    </form>
  )
}

export default function Controls ({ controls, actions }) {
  return (
    <div>
      {
        controls.map((item) => {
          return (
            <Control
              key={item.title}
              control={item}
              actions={actions}
            />
          )
        })
      }
    </div>
  )
}
