import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EmbedList } from './embed_list.jsx'
import { ModalContainer } from '../modal/modal_container.jsx'
import { PlainText } from '../forms/rich_text/plain_text.jsx'

export class EmbedModal extends Component {

  render () {
    const { embed_codes, onChange, setEditing } = this.props

    return (
      <ModalContainer className='EmbedModal' onClick={() => setEditing(null)}>

          <label>Embed Codes:</label>

          <EmbedList
            editing
            embed_codes={embed_codes}
            hasNew
            onChange={onChange}
          />

      </ModalContainer>
    )
  }
}
