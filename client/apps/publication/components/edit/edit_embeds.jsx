import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../../../../components/forms/buttons/button.jsx'
import { Embed } from '../../../../components/embeds/embed_list.jsx'
import { ModalContainer } from '../../../../components/modal/modal_container.jsx'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'

export class EditEmbeds extends Component {
  onNewEmbed = (embed) => {
    const { embed_codes, onChange } = this.props

    embed_codes.push(embed)
    onChange(embed_codes)
    this.setState({ content: '' })
  }

  onRemoveEmbed = (embed, index) => {
    const { embed_codes, onChange } = this.props

    if (embed_codes.length === 1) {
      onChange([])
    } else {
      onChange(embed_codes)
    }
  }

  render () {
    const { embed_codes, onChange, onNew, setEditing } = this.props

    return (
      <ModalContainer className='EditEmbeds' onClick={() => setEditing(null)}>
        <div className='EditEmbeds'>

          <label>Embed Codes:</label>

          {embed_codes.length > 0 &&
            <div className='EditEmbeds__list'>
              {embed_codes.map((embed, index) => {
                return (
                  <div key={index} className='EditEmbeds__list-item'>
                    <Embed item={embed} />
                    <Button
                      icon='times'
                      onClick={() => this.onRemoveEmbed(embed, index)}
                    />
                  </div>
                )
              })}
            </div>
          }

          <div className='EditEmbeds__new'>
            <PlainText
              content=''
              className='EditEmbeds__input p'
              placeholder='Paste embed code...'
              onChange={(value) => this.onNewEmbed(value)}
              forceUpdate
            />
          </div>

        </div>
      </ModalContainer>
    )
  }
}
