import styled from 'styled-components'
import React from 'react'
import { getDate } from 'client/utils'
import { Formats } from 'client/components/formats/formats'
import { Image } from 'client/components/image/image'
import { H1, H4 } from 'client/styles/text'
import { Text } from 'client/components/text/text'
import { Venue, VenueContainer } from 'client/components/venue/venue'
import { Label } from './label'
import { Image as ImageType, Item, Model } from 'client/typings'

interface ItemHeaderProps {
  coverImage?: ImageType
  item: Item
  label?: string
  labelLink?: string
  model: Model
  onChange: (key: string, val: any) => void
  setEditing: (isEditing: string | null) => void
}

export const ItemHeader: React.SFC<ItemHeaderProps> = props => {
  const {
    coverImage,
    item,
    label,
    labelLink,
    model,
    onChange,
    setEditing
  } = props

  const {
    artist,
    formats,
    venue,
    title
  } = item
  const url = coverImage && coverImage.url || ''
  const hasImage = Boolean(coverImage && url)
  const hasVenue = venue && (venue.name || venue.address)
  const isPublication = model === 'publications'
  const date = !isPublication && getDate(model, item)

  return (
    <ItemHeaderContainer model={model} hasImage={hasImage}>
      {label &&
        <Label
          label={label}
          labelLink={labelLink}
          model={model}
        />
      }
      {(artist || isPublication && setEditing) &&
        <H1>
          <Text
            onChange={setEditing ? (value) => onChange('artist', value) : undefined}
            placeholder='Artist'
            text={artist}
          />
        </H1>
      }
      {model !== 'pages' &&
        <H1>
          <Text
            onChange={setEditing ? (value) => onChange('title', value) : undefined}
            placeholder='Add Title'
            text={title}
          />
        </H1>
      }
      {date &&
        <H4 onClick={setEditing ? () => setEditing('dates') : undefined}>
          {date}
        </H4>
      }
      {(formats || isPublication && setEditing) &&
        <Formats
          formats={formats}
          onClick={setEditing ? () => setEditing('formats') : undefined}
        />
      }
      {(hasVenue || model === 'events' && setEditing) &&
        <Venue
          venue={venue || {}}
          onClick={setEditing ? () => setEditing('venue') : undefined}
        />
      }
      { hasImage &&
          <Image {...coverImage}
            onClick={setEditing ? () => setEditing('images') : undefined}
          />
      }
    </ItemHeaderContainer>
  )
}

const ItemHeaderContainer = styled.div<{
  hasImage?: boolean
  model: Model
}>`
  margin-bottom: 2em;

  ${VenueContainer} {
    ${({ hasImage }) => hasImage && `
      padding-bottom: 2em;
    `}
  }

  ${H1} {
    margin-top: 0;
    .public-DraftStyleDefault-block,
    .public-DraftEditorPlaceholder-root {
      padding: 0;
    }
    ${({ model }) => model === 'projects' && `
      margin-top: -6px;
      font-size: 3em;
    `}
  }

  ${H4} {
    margin-bottom: .5em;
  }
`
