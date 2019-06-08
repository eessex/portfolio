import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Image } from 'client/components/image/image'
import { ImageEdit } from 'client/components/image/image_edit'
import { fillwidth } from 'client/utils/fillwidth'

export const ImageRow = props => {
  const { getTrueIndex, images, onClick, onChange, onDelete } = props
  const isGrid = images.length > 1
  const sizedImages = isGrid && fillwidth(images)

  return (
    <ImagesRowContainer isGrid={isGrid}>
      {images.map((image, i) => {
        const hasGutter = isGrid && i !== (images.length - 1)
        const width = sizedImages && sizedImages[i] && sizedImages[i].width

        return (
          <ImageContainer
            key={i}
            width={width ? `${width}px` : '100%'}
            hasGutter={hasGutter}
            onClick={() => onClick && onClick(i)}
          >
            {onChange && onDelete
              ? <ImageEdit
                  image={image}
                  index={i}
                  getTrueIndex={getTrueIndex}
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

export const ImageContainer = styled.div`
  ${props => props.hasGutter && `
    margin-right: 10px;
  `}
  width: ${props => props.width};
  height: auto;
`

ImageRow.propTypes = {
  getTrueIndex: PropTypes.func,
  images: PropTypes.array,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func
}
