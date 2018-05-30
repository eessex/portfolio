import PropTypes from 'prop-types'
import React from 'react'
import { ModalContainer } from '../modal/modal_container.jsx'
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
    <ModalContainer
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

    </ModalContainer>
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
