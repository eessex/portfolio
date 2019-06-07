import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'client/components/Modal/Modal'
import { DatesEdit } from './dates_edit'

export const DatesModal = props => {
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

DatesModal.propTypes = {
  all_day: PropTypes.bool,
  end_date: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func,
  start_date: PropTypes.string
}
