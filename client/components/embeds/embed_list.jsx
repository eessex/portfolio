import styled from 'styled-components'
import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Embed } from './embed.jsx'
import { Button } from '../forms/buttons/button.jsx'
import { PlainText } from '../forms/rich_text/plain_text.jsx'

export class EmbedList extends Component {
  static propTypes = {
    className: PropTypes.string,
    editing: PropTypes.bool,
    embed_codes: PropTypes.array,
    hasNew: PropTypes.bool,
    onChange: PropTypes.func
  }

  onNewEmbed = (embed) => {
    const { embed_codes, onChange } = this.props

    embed_codes.push(embed)
    onChange(embed_codes)
    this.setState({ lastUpdated: new Date() })
  }

  onRemoveEmbed = (embed, index) => {
    const { embed_codes, onChange } = this.props
    const newEmbeds = clone(embed_codes)

    newEmbeds.splice(index, 1)
    onChange(newEmbeds)
  }

  render () {
    const {
      className,
      editing,
      embed_codes,
      hasNew
    } = this.props

    return (
      <div className={`EmbedList ${className || ''}`}>
        {embed_codes && embed_codes.length > 0 &&
          embed_codes.map((embed_code, i) =>
            <EmbedItem className='EmbedList__item' key={i}>
              <Embed embed_code={embed_code} />
              {editing &&
                <Button
                  icon='times'
                  onClick={() => this.onRemoveEmbed(embed_code, i)}
                />
              }
            </EmbedItem>
          )
        }
        {hasNew &&
          <div className='EditEmbeds__new'>
            <PlainText
              content=''
              className='EditEmbeds__input p'
              placeholder='Paste embed code...'
              onChange={(value) => this.onNewEmbed(value)}
              forceUpdate
            />
          </div>
        }
      </div>
    )
  }
}

const EmbedItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 20px;
  .Button {
    position: absolute;
    right: -5px;
    top: -5px;
  }
`
