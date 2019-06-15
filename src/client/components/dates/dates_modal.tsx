import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { DatesEdit, DatesEditProps } from './dates_edit'

interface DatesModalProps extends DatesEditProps {
  setEditing: (isEditing: null | string) => void
}

export const DatesModal: React.SFC<DatesModalProps> = props => {
  const {
    all_day,
    end_date,
    onChange,
    setEditing,
    start_date
  } = props

  const dateProps = {
    all_day,
    end_date,
    start_date
  }

  return (
    <Modal onClick={() => setEditing(null)}>
      <DatesEdit
        {...dateProps}
        onChange={onChange}
      />
    </Modal>
  )
}
