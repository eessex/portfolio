import PropTypes from 'prop-types'
import React from 'react'

export const ImageShow = (props) => {
  const { caption, title, url } = props

  return (
    <div className='ImageShow'>
      <img
        src={url}
        alt={title || ''}
        width='100%'
      />
      {caption &&
        <div
          className='ImageShow__caption'
          dangerouslySetInnerHTML={{__html: caption}}
        />
      }
    </div>
  )
}

ImageShow.propTypes = {
  caption: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string
}
