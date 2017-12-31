import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/images/image/image_show.jsx'

export const PublicationHeader = (props) => {
    const { coverImage, publication } = props
    const {
      artist,
      title,
      layout,
      release_date,
      publisher
    } = publication
    const { url } = coverImage || ''

    return (
      <div className='PublicationHeader' data-layout={layout}>
        <div className='h1'>
          {artist && `${artist}: `}{title}
        </div>
        {release_date &&
          formatPublishDate(release_date, publisher)
        }
        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

PublicationHeader.propTypes = {
  coverImage: PropTypes.object,
  title: PropTypes.string
}

const formatPublishDate = (date, publisher) => {
  const formattedDate = date && publisher ? `, ${date}` : date

  return (
    <div className='h4'>
      {publisher}{formattedDate}
    </div>
  )
}
