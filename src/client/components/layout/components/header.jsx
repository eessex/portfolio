import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { clone } from 'lodash'
import { getDate } from 'client/utils'
import { Image, ImageContainer } from 'client/components/image/image'
import { ImageEdit } from 'client/components/image/image_edit'
import { Formats } from 'client/components/formats/formats'
import { Text } from 'client/components/text/text'
import { Venue, VenueContainer } from 'client/components/venue/venue'
import { Label } from './label'
import { H1, H4 } from 'client/styles/text'

export const ItemHeader = (props) => {
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
  const date = model !== 'publications' && getDate(model, item)

  return (
    <ItemHeaderContainer>
      {label &&
        <Label
          label={label}
          labelLink={labelLink}
          model={model}
        />
      }
      {artist &&
        <H1>
          <Text
            onChange={(value) => onChange('artist', value)}
            placeholder='Artist'
            text={artist}
          />
        </H1>
      }
      <H1>
        <Text
          onChange={(value) => onChange('title', value)}
          placeholder='Add Title'
          text={title}
        />
      </H1>

      {date &&
        <H4 onClick={setEditing ? () => setEditing('dates') : undefined}>
          {date}
        </H4>
      }
      {formats &&
        <Formats
          items={formats}
          onClick={setEditing ? () => setEditing('formats') : undefined}
        />
      }
      {(hasVenue || model === 'events' && setEditing) &&
        <Venue
          venue={venue || {}}
          onClick={setEditing ? () => setEditing('venue') : undefined}
        />
      }
      {hasImage && onChange
        ? (
          <ImageEdit
            item={coverImage}
            index={0}
            onChange={(image) => {
              const newImages = clone(item.images) || []
              newImages[0] = image
              onChange('images', newImages)
            }}
            editCaption
          />
        ) : hasImage && (
          <Image {...coverImage} />
        )
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

  ${H1} {
    margin-top: -6px;
    .public-DraftStyleDefault-block,
    .public-DraftEditorPlaceholder-root {
      padding: 0;
    }
  }

  ${H4} {
    margin-bottom: .5em;
  }

  ${ImageContainer} {
    margin-top: 2em;
  }

  ${VenueContainer}: {
    margin-bottom: 1em;
  }
`
