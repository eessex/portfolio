import PropTypes from 'prop-types'
import React from 'react'

import { getDate } from '../../../utils/index.js'
import { ImageShow } from '../../image/image_show.jsx'
import { ShowFormats } from '../../formats/show_formats.jsx'
import { Text } from '../../text/text.jsx'
import { Venue } from '../../venue/venue.jsx'

export const ItemHeader = (props) => {
    const {
      coverImage,
      item,
      model,
      setEditing
    } = props

    const {
      artist,
      formats,
      venue,
      title,
    } = item

    const { url } = coverImage || ''

    const hasVenue = venue && (venue.name || venue.address)
    const date = model !== 'publications' && getDate(model, item)

    return (
      <div className='ItemHeader'>
        {artist &&
          <Text
            className='h1 artist'
            onClick={setEditing ? () => setEditing('artist') : undefined}
            placeholder='Add Artist'
            text={artist}
          />
        }

        <Text
          className='h1'
          onClick={setEditing ? () => setEditing('title') : undefined}
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

        {hasVenue &&
          <Venue
            venue={venue}
            onClick={setEditing ? () => setEditing('venue') : undefined}
          />
        }

        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

ItemHeader.propTypes = {
  coverImage: PropTypes.object,
  event: PropTypes.object,
  setEditing: PropTypes.func
}
