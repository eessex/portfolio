import styled from 'styled-components'
import { clone } from 'lodash'
import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { PlainText } from 'client/components/text/draft/PlainText'
import { P } from 'client/styles/text'
import { Embed } from './embed'

interface EmbedListProps {
  editing?: boolean
  embed_codes: string[]
  hasNew?: boolean
  onChange?: (embeds: string[]) => void
}

export class EmbedList extends Component<EmbedListProps> {
  onNewEmbed = embed => {
    const { embed_codes, onChange } = this.props

    embed_codes.push(embed)
    onChange(embed_codes)
    this.setState({ lastUpdated: new Date() })
  }

  onRemoveEmbed = (index) => {
    const { embed_codes, onChange } = this.props
    const newEmbeds = clone(embed_codes)

    newEmbeds.splice(index, 1)
    onChange(newEmbeds)
  }

  render () {
    const {
      editing,
      embed_codes,
      hasNew
    } = this.props

    return (
      <div>
        {embed_codes && embed_codes.length > 0 &&
          embed_codes.map((embed_code, i) =>
            <EmbedItem key={i}>
              <Embed embed_code={embed_code} />
              {editing &&
                <Button
                  icon='times'
                  onClick={() => this.onRemoveEmbed(i)}
                />
              }
            </EmbedItem>
          )
        }
        {hasNew && editing &&
          <P>
            <PlainText
              content=''
              placeholder='Paste embed code...'
              onChange={(value) => this.onNewEmbed(value)}
              forceUpdate
            />
          </P>
        }
      </div>
    )
  }
}

const EmbedItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 20px;

  button {
    position: absolute;
    right: -5px;
    top: -5px;
  }
`
