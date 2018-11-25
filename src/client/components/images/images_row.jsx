import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Image } from 'client/components/image/image'
import { fillwidth } from 'client/utils/fillwidth'

export const ImagesRow = props => {
  const { isGrid, onClick } = props

  const images = isGrid ? fillwidth(props.images) : props.images
  const isMultiple = images.length > 1
  console.log('isGrid', isGrid, 'isMultiple', isMultiple)
  return (
    <ImagesRowContainer isGrid={isGrid}>
      {images.map((image, i) => {
        const hasGutter = isGrid && isMultiple && i !== (images.length - 1)
        return (
          <ImageContainer
            key={i}
            width={image.width ? `${image.width}px` : '100%'}
            hasGutter={hasGutter}
            onClick={() => onClick && onClick(i)}
          >
            <Image {...image} />
          </ImageContainer>
        )
      })}
    </ImagesRowContainer>
  )
}

const ImagesRowContainer = styled.div`
  ${props => props.isGrid && `
    display: flex;
    align-items: center;
  `}
`

const ImageContainer = styled.div`
  ${props => props.hasGutter && `
    margin-right: 10px;
  `}
  width: ${props => props.width};
`

ImagesRow.propTypes = {
  isGrid: PropTypes.bool,
  images: PropTypes.array,
  onClick: PropTypes.func
}
