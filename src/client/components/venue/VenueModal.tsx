import React from 'react'
import { Modal } from 'client/components/Modal/Modal'
import { VenueEdit } from './VenueEdit'
import { Venue } from 'client/typings'

interface VenueModalProps {
  onChange: (val: Venue) => void
  setEditing: (editing: any) => void
  venue?: Venue
}

export const VenueModal: React.SFC<VenueModalProps> = ({
  onChange,
  setEditing,
  venue
}) => {
  return (
    <Modal onClick={() => setEditing(null)}>
      <label>Venue</label>
      <VenueEdit
        venue={venue}
        onChange={onChange}
      />
    </Modal>
  )
}
