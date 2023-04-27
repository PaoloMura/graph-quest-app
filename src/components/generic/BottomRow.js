import React from 'react'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'

export default function BottomRow ({ colSpan, onClick }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <IconButton onClick={onClick}>
          <AddIcon/>
        </IconButton>
      </td>
    </tr>
  )
}