import PropTypes from 'prop-types'
import React from 'react'
import { ModalContainer } from '../modal/modal_container.jsx'
import { FormatsEdit } from'./formats_edit.jsx'

export const FormatsModal = (props) => {
  const {
    formats,
    onChange,
    setEditing
  } = props

  return (
    <ModalContainer
      className='FormatsModal'
      onClick={() => setEditing(null)}
    >
      <label>Formats:</label>
      <FormatsEdit
        {...props}
      />
    </ModalContainer>
  )
}

FormatsModal.propTypes = {
  formats: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  setEditing: PropTypes.func.isRequired
}