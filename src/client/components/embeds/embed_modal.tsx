import React from 'react'
import { Modal } from 'client/components/modal/modal'
import { EmbedList } from './embed_list'

interface EmbedModalProps {
  embed_codes: string[]
  setEditing: (editing: string | null) => void
  onChange: (embeds: string[]) => void
}

export const EmbedModal: React.SFC<EmbedModalProps> = ({
  embed_codes,
  onChange,
  setEditing
}) => {
  return (
    <Modal onClick={() => setEditing(null)}>
      <label>
        Embeds
      </label>

      <EmbedList
        editing
        embed_codes={embed_codes}
        hasNew
        onChange={onChange}
      />
    </Modal>
  )
}
