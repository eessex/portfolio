import styled from 'styled-components'
import React from 'react'
import { clone } from 'lodash'
import { Image } from 'client/components/image/image'
import { ImageEdit } from 'client/components/image/image_edit'
import { fillwidth } from 'client/utils/fillwidth'
import { Image as ImageType } from 'client/typings'

export interface ImageRowProps {
  fetchUpload: () => void
  getTrueIndex: () => void
  images: ImageType[]
  onClick: (i: number) => void
  onChange: () => void 
  onDelete: () => void
}

export const ImageRow: React.SFC<ImageRowProps> = props => {
  const { fetchUpload, getTrueIndex, images, onClick, onChange, onDelete } = props
  const isGrid = images.length > 1
  const sizedImages = isGrid && fillwidth(clone(images))

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
                  fetchUpload={fetchUpload}
                  getTrueIndex={getTrueIndex}
                  onChange={onChange}
                  onDelete={onDelete}
                  editCaption
                />
              : 
              <Image {...image} />
            }
          </ImageContainer>
        )
      })}
    </ImagesRowContainer>
  )
}

const ImagesRowContainer = styled.div<{ isGrid?: boolean}>`
  max-width: 100%;

  ${({ isGrid }) => isGrid && `
    display: flex;
    align-items: flex-start;
  `}
`

export const ImageContainer = styled.div<{ hasGutter?: boolean, width?: string}>`
  ${({ hasGutter }) => hasGutter && `
    margin-right: 10px;
  `}
  width: ${({ width }) => width};
  height: auto;
`
