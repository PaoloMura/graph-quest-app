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
      <Button variant={'link'} onClick={(e) => onClick(myKey, e)}>
        {text}
      </Button>
    </td>
  )
}

function DeleteButton ({ item, onDelete }) {
  return (
    <td>
      <IconButton onClick={(e) => onDelete(item, e)}>
        <DeleteIcon/>
      </IconButton>
    </td>
  )
}

function ShareButton ({ myKey, onShare }) {
  return (
    <td>
      <IconButton onClick={(e) => onShare(myKey, e)}>
        <LinkIcon/>
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

function TextInput ({ myKey, text, onChange }) {
  return (
    <td>
      <Form.Control
        placeholder="Class name"
        value={text}
        onChange={(e) => onChange(myKey, e)}/>
    </td>
  )
}

export default function TableRow ({
  myKey,
  text,
  link,
  selectedChoice,
  choices,
  onChangeOption,
  input,
  onChangeInput,
  share,
  onDelete
}) {
  return (
    <tr>
      {text && (link ? <Link text={text} myKey={myKey} onClick={link}/> : <Text text={text}/>)}
      {choices && <DropDown selected={selectedChoice} choices={choices} onChange={onChangeOption} myKey={myKey}/>}
      {input !== undefined && <TextInput myKey={myKey} text={input} onChange={onChangeInput}/>}
      <DeleteButton item={myKey} onDelete={onDelete}/>
      {share !== undefined && <ShareButton myKey={myKey} onShare={share}/>}
    </tr>
  )
}