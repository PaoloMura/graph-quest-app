import React from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import LinkIcon from '@mui/icons-material/Link'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

function Text ({ text }) {
  return (
    <td>{text}</td>
  )
}

function Link ({ text, myKey, onClick }) {
  return (
    <td>
      <Button variant='link' onClick={(e) => onClick(myKey, e)}>
        {text}
      </Button>
    </td>
  )
}

function DeleteButton ({ item, onDelete }) {
  return (
    <td>
      <IconButton onClick={(e) => onDelete(item, e)}>
        <DeleteIcon />
      </IconButton>
    </td>
  )
}

function ShareButton ({ myKey, onShare }) {
  return (
    <td>
      <IconButton onClick={(e) => onShare(myKey, e)}>
        <LinkIcon />
      </IconButton>
    </td>
  )
}

function DropDown ({ selected, choices, onChange, myKey }) {
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

export default function TableRow ({
  myKey,
  text,
  link,
  selectedFile,
  files,
  onChangeFile,
  selectedClass,
  classes,
  onChangeClass,
  share,
  onDelete
}) {
  return (
    <tr>
      {text && (link ? <Link text={text} myKey={myKey} onClick={link} /> : <Text text={text} />)}
      {files && <DropDown selected={selectedFile} choices={files} onChange={onChangeFile} myKey={myKey} />}
      {classes && <DropDown selected={selectedClass} choices={classes} onChange={onChangeClass} myKey={myKey} />}
      <DeleteButton item={myKey} onDelete={onDelete} />
      {share !== undefined && <ShareButton myKey={myKey} onShare={share} />}
    </tr>
  )
}
