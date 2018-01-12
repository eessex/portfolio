import PropTypes from 'prop-types'
import React from 'react'
import { ModalContainer } from '../modal/modal_container.jsx'
import { LinksEdit } from './links_edit.jsx'

export const LinksModal = (props) => {
  const {
    onChange,
    setEditing,
    links,
  } = props

  return (
    <ModalContainer
      className='LinksModal'
      onClick={() => setEditing(null)}
    >
      <label>
        Links:
      </label>

      <LinksEdit
        links={links || []}
        onChange={onChange}
      />
    </ModalContainer>
  )
}
