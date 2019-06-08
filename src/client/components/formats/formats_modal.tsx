import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { FormatsEdit, FormatsEditProps } from './formats_edit'

interface FormatsModalProps extends FormatsEditProps {
  setEditing: (editing: string | null) => void
}

export const FormatsModal: React.SFC<FormatsModalProps> = props => {
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
