import React from 'react'

export default function Description ({ description, controls }) {
  return (
    <div>
      <h3>Description</h3>
      <p>{description}</p>
      <br />
      {
        controls !== undefined &&
          <>
            <h3>Controls</h3>
            <ul>
              {
              controls.map((control, idx) => (
                <li key={idx}>{control}</li>
              ))
            }
            </ul>
            <br />
          </>
      }
    </div>
  )
}
