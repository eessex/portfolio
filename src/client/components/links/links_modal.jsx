import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { LinksEdit } from './links_edit'

export const LinksModal = props => {
  const {
    onChange,
    setEditing,
    links
  } = props

  return (
    <Modal onClick={() => setEditing(null)}>
      <Label>Links</Label>
      <LinksEdit
        links={links || []}
        onChange={onChange}
      />
    </Modal>
  )
}

const Label = styled.label`
  padding-bottom: 10px;
`

LinksModal.propTypes = {
  links: PropTypes.array,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
