import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { FormatsEdit } from './formats_edit'

export const FormatsModal = (props) => {
  const { setEditing } = props

  return (
    <Modal onClick={() => setEditing(null)}>
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
