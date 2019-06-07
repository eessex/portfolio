import styled from 'styled-components'
import React from 'react'
import { Modal } from 'client/components/Modal/Modal'
import { Link } from 'client/typings'
import { LinksEdit } from './LinksEdit'

interface LinksModalProps {
  links?: Link[]
  onChange: (links: Link[]) => void
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
