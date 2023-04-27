import React from 'react'
import IconButton from '@mui/material/IconButton'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import DeleteIcon from '@mui/icons-material/Delete'
import LinkIcon from '@mui/icons-material/Link'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

export function TblText ({ myKey, text, onClick }) {
  if (onClick) {
    return (
      <td>
        <Button variant='link' onClick={(e) => onClick(myKey, e)}>
          {text}
        </Button>
      </td>
    )
  }
  return (
    <td>{text}</td>
  )
}

export function TblButton ({ myKey, icon, onClick }) {
  const icons = {
    download: <FileDownloadIcon />,
    delete: <DeleteIcon />,
    share: <LinkIcon />
  }

  return (
    <td>
      <IconButton onClick={(e) => onClick(myKey, e)}>
        {icons[icon]}
      </IconButton>
    </td>
  )
}

export function TblDropDown ({ myKey, selected, choices, onChange }) {
  return (
    <td>
      <Form.Select onChange={(e) => onChange(myKey, e)} defaultValue={selected}>
        {choices.map((choice) => (
          <option key={choice} value={choice}>{choice}</option>
        ))}
      </Form.Select>
    </td>
  )
}
