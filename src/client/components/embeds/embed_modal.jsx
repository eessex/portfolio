import PropTypes from 'prop-types'
import React from 'react'
import { EmbedList } from './embed_list'
import { Modal } from 'client/components/modal/modal'

export const EmbedModal = (props) => {
  const {
    embed_codes,
    onChange,
    setEditing
  } = props

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

EmbedModal.propTypes = {
  embed_codes: PropTypes.array,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
