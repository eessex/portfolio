import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { clone } from 'lodash'
import { getDate } from '../../../utils/index.js'
import { Image } from '../../image/image.jsx'
import { ImageEdit } from '../../image/image_edit.jsx'
import { Formats } from '../../formats/formats.jsx'
import { Text } from '../../text/text.jsx'
import { Venue } from '../../venue/venue.jsx'
import { Label } from './label.jsx'
import { H1 } from '../../../styles/text.jsx'

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
        <h4 onClick={setEditing ? () => setEditing('dates') : undefined}>
          {date}
        </h4>
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
    .public-DraftStyleDefault-block.public-DraftStyleDefault-ltr,
    public-DraftEditorPlaceholder-root {
      padding: 0;
    }
  }

  .h6, h6 {
    margin: 0;
  }

  .Image {
    margin-top: 2em;
  }
}
`
