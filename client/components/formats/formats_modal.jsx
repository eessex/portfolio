import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from '../modal/modal.jsx'
import { FormatsEdit } from './formats_edit.jsx'

export const FormatsModal = (props) => {
  const { setEditing } = props

  return (
    <Modal
      className='FormatsModal'
      onClick={() => setEditing(null)}
    >
      <label>Formats:</label>
      <FormatsEdit
        {...props}
      />
    </Modal>
  )
}

FormatsModal.propTypes = {
  setEditing: PropTypes.func.isRequired
}
