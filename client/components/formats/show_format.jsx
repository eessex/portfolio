import PropTypes from 'prop-types'
import React from 'react'

export const ShowFormat = (props) => {
  const { item, short, onClick } = props
  const {
    format,
    publisher,
    release_year
  } = item
  const formattedFormat = format && (publisher || (release_year && !short)) ? `${format}, ` : format
  const formattedPublisher = release_year && !short ? `${publisher}, ` : publisher

  return (
    <div className='ShowFormat' onClick={onClick && onClick}>
      {formattedFormat}
      {publisher && formattedPublisher}
      {!short && release_year}
    </div>
  )
}

ShowFormat.propTypes = {
  item: PropTypes.object,
  short: PropTypes.bool,
  onClick: PropTypes.func
}
