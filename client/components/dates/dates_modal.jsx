import PropTypes from 'prop-types'
import React from 'react'
import { ModalContainer } from '../modal/modal_container.jsx'
import { DatesEdit } from '../dates/dates_edit.jsx'

export const DatesModal = (props) => {
  const {
    all_day,
    end_date,
    onChange,
    setEditing,
    start_date,
  } = props

  const dateProps = {
    all_day,
    end_date,
    start_date,
  }

  return (
    <ModalContainer
      className='DatesModal'
      onClick={() => setEditing(null)}
    >
      <DatesEdit
        {...dateProps}
        onChange={onChange}
      />
    </ModalContainer>
  )
}
