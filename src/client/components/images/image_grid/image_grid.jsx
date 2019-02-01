import styled from 'styled-components'
import PropTypes from 'prop-types'
import { cloneDeep, extend } from 'lodash'
import React from 'react'
import { ImageRow } from './image_row'

export class ImageGrid extends React.Component {
  getTrueIndex = (i, isSecondRow) => {
    const { firstRow, increment } = this.getImageRows()
    let indexWithCover = i + increment

    return isSecondRow
      ? indexWithCover + firstRow.length
      : indexWithCover
  }

  getImageRows = () => {
    const { images, hasCover } = this.props
    let increment = 0
    const displayImages = cloneDeep(images)

    if (hasCover) {
      displayImages.splice(0, 1)
      increment = increment + 1
    }
    const { firstRow, secondRow } = getRows(displayImages)

    return {
      displayImages,
      increment,
      firstRow,
      secondRow
    }
  }

  onChange = (image, i, isSecondRow) => {
    const { images, onChange } = this.props
    const index = this.getTrueIndex(i, isSecondRow)
    const newImage = extend(images[index], image)

    onChange(newImage, index)
  }

  onDelete = (i, isSecondRow) => {
    const index = this.getTrueIndex(i, isSecondRow)
    this.props.onDelete(index)
  }

  render () {
    const { onClick, onChange, onDelete } = this.props
    const {
      firstRow,
      secondRow
    } = this.getImageRows()

    return (
      <ImagesContainer isOverflow={secondRow} onClick={onClick && onClick}>
        <ImageRow
          images={firstRow}
          onChange={onChange ? (img, i) => this.onChange(img, i) : undefined}
          onDelete={onDelete ? (i) => this.onDelete(i) : undefined}
        />

        {secondRow &&
          <ImageRow
            images={secondRow}
            onChange={onChange ? (img, i) => this.onChange(img, i, true) : undefined}
            onDelete={onDelete ? (i) => this.onDelete(i, true) : undefined}
          />
        }
      </ImagesContainer>
    )
  }
}

export const getFirstRowLength = (images = []) => {
  const length = images.length
  const isEven = length % 2 === 0
  const isByThree = length % 3 === 0
  const isOverflow = length > 3

  if (isOverflow) {
    if (isEven) {
      return length / 2
    } else if (isByThree) {
      return length / 3
    } else if (length === 5) {
      return 2
    } else if (length === 7) {
      return 3
    }
  }
  return 0
}

export const getRows = (images = []) => {
  const increment = getFirstRowLength(images)
  let firstRow = cloneDeep(images)
  let secondRow

  if (images.length > 3) {
    secondRow = cloneDeep(images)
    firstRow = secondRow.splice(0, increment)
  }

  return {
    firstRow,
    secondRow,
    increment
  }
}

const ImagesContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 100%;

  ${props => props.isOverflow && `
    flex-direction: column;
  `}
`

ImageGrid.propTypes = {
  hasCover: PropTypes.bool,
  images: PropTypes.array,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func
}
