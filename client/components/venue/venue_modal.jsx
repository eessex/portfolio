import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from '../modal/modal.jsx'
import { VenueEdit } from './venue_edit.jsx'

export const VenueModal = props => {
  const {
    onChange,
    setEditing,
    venue
  } = props

  return (
    <Modal
      className='VenueModal'
      onClick={() => setEditing(null)}
    >
      <label>Venue</label>
      <VenueEdit
        venue={venue || {}}
        onChange={onChange}
      />
    </Modal>
  )
}

VenueModal.propTypes = {
  onChange: PropTypes.func,
  setEditing: PropTypes.func,
  venue: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    name: PropTypes.string,
    state: PropTypes.string
  })
}
