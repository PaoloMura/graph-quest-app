import React from 'react'

export default function NotFound ({ error }) {
  return (
    <div>
      <h1>Not found :(</h1>
      <p>{error}</p>
    </div>
  )
}
