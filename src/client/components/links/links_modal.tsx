import styled from 'styled-components'
import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { Link } from 'client/typings'
import { LinksEdit } from './links_edit'

interface LinksModalProps {
  links: Link[]
  onChange: (val: Link[]) => void
  setEditing: (editing: string | null) => void
}

export const LinksModal: React.SFC<LinksModalProps> = ({
  onChange,
  setEditing,
  links
}) => {
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
