import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Image } from 'client/components/image/image'
import { ImageEdit } from 'client/components/image/image_edit'
import { fillwidth } from 'client/utils/fillwidth'

export const ImageRow = props => {
  const { onClick, onChange, onDelete } = props
  const isGrid = props.images.length > 1
  const images = isGrid ? fillwidth(props.images) : props.images
  const isMultiple = images.length > 1

  return (
    <ImagesRowContainer isGrid={isGrid}>
      {images.map((image, i) => {
        const hasGutter = isGrid && isMultiple && i !== (images.length - 1)

        return (
          <ImageContainer
            key={i}
            width={image.width ? `${image.width}px` : '100%'}
            height={image.height ? `${image.height}px` : 'auto'}
            hasGutter={hasGutter}
            onClick={() => onClick && onClick(i)}
          >
            {onChange
              ? <ImageEdit
                index={i}
                item={image}
                onChange={onChange}
                onDelete={onDelete}
                editCaption
              />
              : <Image {...image} />
            }
          </ImageContainer>
        )
      })}
    </ImagesRowContainer>
  )
}

const ImagesRowContainer = styled.div`
  max-width: 100%;
  ${props => props.isGrid && `
    display: flex;
    align-items: flex-start;
  `}
`

const ImageContainer = styled.div`
  ${props => props.hasGutter && `
    margin-right: 10px;
  `}
  width: ${props => props.width};
`

ImageRow.propTypes = {
  images: PropTypes.array,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func
}
