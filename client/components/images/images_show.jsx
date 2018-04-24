import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../image/image_show.jsx'

export const ImagesShow = (props) => {
  const { images } = props

  return (
    <div className='ImagesShow'>
      {images.map((image, i) => {
        return <ImageShow {...image} key={i} />
      })}
    </div>
  )
}

ImagesShow.propTypes = {
  images: PropTypes.array
}
