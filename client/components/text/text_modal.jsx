import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from '../modal/modal.jsx'
import { PlainText } from '../forms/rich_text/plain_text.jsx'

export const TextModal = props => {
  const {
    className,
    label,
    onChange,
    placeholder,
    setEditing,
    text
  } = props

  return (
    <Modal
      className='TextModal'
      onClick={() => setEditing(null)}
    >
      {label &&
        <label>{label}</label>
      }
      <PlainText
        content={text}
        placeholder={placeholder}
        className={`EditText ${className || ''}`}
        onChange={(value) => onChange(value)}
      />

    </Modal>
  )
}

TextModal.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired,
  text: PropTypes.string
}
