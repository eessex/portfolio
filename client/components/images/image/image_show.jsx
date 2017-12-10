import PropTypes from 'prop-types'
import React from 'react'
import { stripTags } from 'underscore.string'

export const ImageShow = (props) => {
  const { aspect, caption, url } = props
  const alt = stripTags(caption) || ''

  return (
    <div className='ImageShow'>
      <img
        src={url}
        alt={alt}
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
