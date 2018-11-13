import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { PlainText } from 'client/components/text/draft/PlainText'

export const TextModal = props => {
  const {
    label,
    onChange,
    placeholder,
    setEditing,
    text
  } = props

  return (
    <Modal onClick={() => setEditing(null)}>
      {label &&
        <label>{label}</label>
      }
      <PlainText
        content={text}
        placeholder={placeholder}
        onChange={(value) => onChange(value)}
      />

    </Modal>
  )
}

TextModal.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired,
  text: PropTypes.string
}
