import PropTypes from 'prop-types'
import React from 'react'
import { Formats } from '../../formats/formats.jsx'

export const ItemGrid = props => {
  const {
    artist,
    date,
    description,
    formats,
    image,
    title,
    venue
  } = props
  const hasImage = image && image.url.length
  const titleClass = hasImage ? ' h3' : ' h1'

  return (
    <div className='Item ItemGrid'>
      {hasImage &&
        <img
          className='Item__img'
          src={image.url}
          width='100%' />
      }
      <div className='Item__body'>
        <div className={'Item__title' + titleClass}>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </div>
        {date && !formats &&
          <h5 className='Item__date'>
            {date}
          </h5>
        }
        {venue &&
          <h5 className='Item__venue'>
            {venue}
          </h5>
        }
        {formats && formats.length &&
          <h5 className='Item__formats'>
            <Formats items={formats} />
          </h5>
        }
        {description &&
          <p className='Item__description'>
            {description}
          </p>
        }
      </div>
    </div>
  )
}

ItemGrid.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  description: PropTypes.string,
  formats: PropTypes.array,
  image: PropTypes.object,
  title: PropTypes.string,
  venue: PropTypes.string
}
