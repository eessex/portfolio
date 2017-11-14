import PropTypes from 'prop-types'
import React from 'react'

export const ItemGrid = (props) => {
  const {
    date,
    description,
    image,
    title,
    venue
  } = props
  const hasImage = image && image.url.length
  const titleClass = hasImage ? ' h3' : ' h1'

  return(
    <div className='Item ItemGrid'>
      {hasImage &&
        <img
          className='Item__img' 
          src={image.url}
          width='100%' />
      }
      <div className='Item__body'>
        <div className={'Item__title' + titleClass}>
          {title || 'Missing Title'}
        </div>
        <h5 className='Item__date'>
          {date}
        </h5>
        {venue &&
          <h5 className='Item__venue'>
            {venue}
          </h5>
        }
        {description &&
          <p className='Item__description'>
            {venue}
          </p>
        }
      </div>
    </div>
  )
}

ItemGrid.propTypes = {
  date: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.object,
  title: PropTypes.string,
  venue: PropTypes.string
}
