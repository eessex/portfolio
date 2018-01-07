import PropTypes from 'prop-types'
import React from 'react'

import { getDate } from '../../../utils/index.js'
import { ImageShow } from '../../../components/image/image_show.jsx'
import { Title } from '../../../components/layout/components/title.jsx'
import { Venue } from '../../../components/venue/venue.jsx'

export const EventHeader = (props) => {
    const {
      coverImage,
      event,
      setEditing
    } = props

    const {
      venue,
      title,
      end_date,
      start_date
    } = event

    const { url } = coverImage || ''

    const editDates = () => setEditing('date')
    const editTitle = () => setEditing('title')
    const editVenue = () => setEditing('venue')

    const hasVenue = venue && (venue.name || venue.address)
    const date = getDate('events', event)

    return (
      <div className='EventHeader'>
        <Title title={title} onClick={setEditing ? editTitle : undefined} />

        {date &&
          <h4 onClick={setEditing && editDates}>{date}</h4>
        }

        {hasVenue &&
          <Venue venue={venue} onClick={setEditing && editVenue} />
        }

        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

EventHeader.propTypes = {
  coverImage: PropTypes.object,
  event: PropTypes.object,
  setEditing: PropTypes.func
}
