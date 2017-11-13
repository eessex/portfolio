import PropTypes from 'prop-types'
import React from 'react'

export const ItemGrid = (props) => {
  const { date, description, image, title, venue } = props
  const hasImage = image && image.url.length

  return(
    <div className='Item ItemGrid'>
      {hasImage &&
        <img
          className='Item__img' 
          src={image.url}
          width='100%' />
      }
      <div className='Item__body'>
        {renderTitle(title, hasImage)}
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

function renderTitle (title, large) {
  if (large) {
    return (
      <h3 className='Item__title'>
        {title || 'Missing Title'}
      </h3>
    )
  } else {
    return (
      <h1 className='Item__title'>
        {title || 'Missing Title'}
      </h1>
    )
  }
}

ItemGrid.propTypes = {
  date: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.object,
  title: PropTypes.string,
  venue: PropTypes.string
}
