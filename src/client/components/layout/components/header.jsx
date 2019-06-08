import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { clone } from 'lodash'
import { getDate } from 'client/utils'
import { Formats } from 'client/components/formats/formats'
import { Image } from 'client/components/image/image'
import { H1, H4 } from 'client/styles/text'
import { Text } from 'client/components/text/text'
import { Venue, VenueContainer } from 'client/components/venue/venue'
import { Label } from './label'

export const ItemHeader = props => {
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

  const { url } = coverImage || ''
  const hasImage = coverImage && url
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
          formats={formats || []}
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

ItemHeader.propTypes = {
  coverImage: PropTypes.object,
  event: PropTypes.object,
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.any,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}

const ItemHeaderContainer = styled.div`
  margin-bottom: 2em;

  ${VenueContainer} {
    ${props => props.hasImage && `
      padding-bottom: 2em;
    `}
  }
  ${H1} {
    margin-top: 0;
    .public-DraftStyleDefault-block,
    .public-DraftEditorPlaceholder-root {
      padding: 0;
    }
    ${props => props.model === 'projects' && `
      margin-top: -6px;
      font-size: 3em;
    `}
  }

  ${H4} {
    margin-bottom: .5em;
  }
`
