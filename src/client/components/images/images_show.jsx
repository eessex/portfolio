import styled from 'styled-components'
import PropTypes from 'prop-types'
import { cloneDeep } from 'lodash'
import React from 'react'
import { ImagesRow } from './images_row'
// import { Image, ImageContainer } from 'client/components/image/image'

export class ImagesShow extends React.Component {
  state = {
    isOpen: false,
    slideIndex: null
  }

  setSlideIndex = index => {
    const { displayImages, images } = this.props
    let slideIndex = index
    const isOpen = slideIndex !== null
    const isIncompleteImageSet = images.length !== displayImages.length

    if (isIncompleteImageSet) {
      slideIndex += 1
    }
    this.setState({ isOpen, slideIndex })
  }

  render () {
    const { displayImages, isGrid, onClick } = this.props
    // const { isOpen, slideIndex } = this.state
    const { firstRow, secondRow, increment } = getRows(displayImages)
    // const slideShowImage = isOpen && images[slideIndex]

    return (
      <ImagesContainer isGrid={isGrid} isOverflow={secondRow} onClick={onClick}>
        <ImagesRow images={firstRow} isGrid={isGrid} onClick={this.setSlideIndex} />

        {secondRow &&
          <ImagesRow images={secondRow} onClick={(i) => this.setSlideIndex(i + increment)} />
        }

        {/* {isOpen &&
          <SlideShowContainer>
            <Image {...slideShowImage} />
          </SlideShowContainer>
        } */}
      </ImagesContainer>
    )
  }
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
  return 0
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
    secondRow,
    increment: firstRowLength
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

// const SlideShowContainer = styled.div`
//   position: fixed;
//   left: 20px;
//   right: 20px;
//   top: 15px;
//   bottom: 15px;
//   z-index: 1;
//   padding: 20px;
//   border: 1px solid;
//   background: white;
//   ${ImageContainer} {
//     height: 100%;
//     img {
//       max-height: 100%;
//       width: inherit;
//     }
//   }
// `

ImagesShow.propTypes = {
  isGrid: PropTypes.bool,
  displayImages: PropTypes.array,
  images: PropTypes.array,
  onClick: PropTypes.func
}
