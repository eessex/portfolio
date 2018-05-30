import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { clone } from 'lodash'
import { getDate } from '../../../utils/index'
import { ImageShow } from '../../image/image_show'
import { ImageEdit } from '../../image/image_edit'
import { ShowFormats } from '../../formats/show_formats'
import { Text } from '../../text/text'
import { Venue } from '../../venue/venue'
import { Label } from './label'

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
    <ItemHeaderContainer className='ItemHeader'>
      {label &&
        <Label
          label={label}
          labelLink={labelLink}
          model={model}
        />
      }
      {artist &&
        <Text
          className='h1'
          onChange={(value) => onChange('artist', value)}
          placeholder='Artist'
          text={artist}
        />
      }
      <Text
        className='h1'
        onChange={(value) => onChange('title', value)}
        placeholder='Add Title'
        text={title}
      />
      {date &&
        <h4 onClick={setEditing ? () => setEditing('dates') : undefined}>
          {date}
        </h4>
      }
      {formats &&
        <ShowFormats
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
          <ImageShow {...coverImage} />
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
  labelLink: PropTypes.string,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}

const ItemHeaderContainer = styled.div`
  .h1 .public-DraftStyleDefault-block.public-DraftStyleDefault-ltr {
    padding: 0;
  }
`
