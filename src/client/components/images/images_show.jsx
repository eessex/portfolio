import PropTypes from 'prop-types'
import React from 'react'
import { Image } from 'client/components/image/image'

export const ImagesShow = props => {
  const { images } = props

  return (
    <div>
      {images.map((image, i) => {
        return <Image {...image} key={i} />
      })}
    </div>
  )
}

ImagesShow.propTypes = {
  images: PropTypes.array
}