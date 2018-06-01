import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from '../modal/modal.jsx'
import { LinksEdit } from './links_edit.jsx'

export const LinksModal = props => {
  const {
    onChange,
    setEditing,
    links
  } = props

  return (
    <Modal
      className='LinksModal'
      onClick={() => setEditing(null)}
    >
      <label>Links</label>
      <LinksEdit
        links={links || []}
        onChange={onChange}
      />
    </Modal>
  )
}

LinksModal.propTypes = {
  links: PropTypes.array,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
