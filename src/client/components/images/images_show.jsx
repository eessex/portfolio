import styled from 'styled-components'
import PropTypes from 'prop-types'
import { cloneDeep } from 'lodash'
import React from 'react'
import { ImagesRow } from './images_row'

export const ImagesShow = props => {
  const { images, isGrid, onClick } = props
  const { firstRow, secondRow } = getRows(images)

  return (
    <ImagesContainer isGrid={isGrid} isOverflow={secondRow}>
      <ImagesRow images={firstRow} isGrid={isGrid} />

      {secondRow &&
        <ImagesRow images={secondRow} onClick={onClick} />
      }
    </ImagesContainer>
  )
}

const getFirstRowLength = images => {
  const length = images.length
  const isEven = length % 2 === 0
  const isByThree = length % 3 === 0
  const isOverflow = length > 3

  if (isOverflow) {
    if (isEven && length !== 6) {
      return length / 2
    } else if (isByThree) {
      return length / 3
    } else if (length === 5) {
      return 2
    } else if (length === 7) {
      return 3
    }
  }
}

const getRows = images => {
  const firstRowLength = getFirstRowLength(images)
  let firstRow = cloneDeep(images)
  let secondRow

  if (images.length > 3) {
    secondRow = cloneDeep(images)
    firstRow = secondRow.splice(0, firstRowLength)
  }

  return {
    firstRow,
    secondRow
  }
}

const ImagesContainer = styled.div`
  ${props => props.isGrid && `
    display: flex;
    align-items: center;
  `}
  ${props => props.isOverflow && `
    flex-direction: column;
  `}
`

ImagesShow.propTypes = {
  isGrid: PropTypes.bool,
  images: PropTypes.array,
  onClick: PropTypes.func
}
