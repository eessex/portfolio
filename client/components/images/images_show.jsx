import PropTypes from 'prop-types'
import React from 'react'
import { Image } from '../image/image.jsx'

export const ImagesShow = props => {
  const { images } = props

  return (
    <div className='ImagesShow'>
      {images.map((image, i) => {
        return <Image {...image} key={i} />
      })}
    </div>
  )
}

ImagesShow.propTypes = {
  images: PropTypes.array
}
