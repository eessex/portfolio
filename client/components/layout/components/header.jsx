import PropTypes from 'prop-types'
import React from 'react'

import { getDate } from '../../../utils/index.js'
import { ImageShow } from '../../image/image_show.jsx'
import { ShowFormats } from '../../formats/show_formats.jsx'
import { Text } from '../../text/text.jsx'
import { Venue } from '../../venue/venue.jsx'
import { Label } from './label.jsx'

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
      title,
    } = item

    const { url } = coverImage || ''
    const hasVenue = venue && (venue.name || venue.address)
    const date = model !== 'publications' && getDate(model, item)

    return (
      <div className='ItemHeader'>
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

        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

ItemHeader.propTypes = {
  coverImage: PropTypes.object,
  event: PropTypes.object,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
