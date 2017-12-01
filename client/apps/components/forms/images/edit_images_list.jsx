import PropTypes from 'prop-types'
import React from 'react'
import { Button } from'../buttons/button.jsx'
import { FileInput } from '../file_input/index.jsx'

export class EditImagesList extends React.Component {
  static propTypes = {
    fetchUpload: PropTypes.func,
    images: PropTypes.array,
    onChange: PropTypes.func
  }

  state = {
    images: this.props.images
  }

  newImage = (image) => {
    const { images } = this.state
    images.push(image)

    this.props.onChange(images)
  }

  onChange = (image, index) => {
    const { images } = this.state
    const newImages = images

    newImages[index] = image
    this.setState({ images: newImages })
    this.props.onChange(newImages)
  }

  onDelete = (index) => {
    const { onChange, onDelete } = this.props
    let cleanedImages = this.state.images

    cleanedImages.splice(index, 1)
    onChange(cleanedImages)
    if (onDelete) {
      onDelete()
    }
  }

  checkEmpty = () => {
    const { images } = this.state
    let cleanedImages = images

    images.map((image, index) => {
      if (!image.url.length) {
        cleanedImages.splice(index, 1)
      }
    })
    return cleanedImages
  }

  render () {
    const { images } = this.state
    const { fetchUpload } = this.props

    return (
      <div className='EditImages'>
        {images.map((image, index) =>
          <div
            key={index}
            className='EditImages__item'
          >
            <FileInput
              hasPreview
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChange(image, index)}
              onDelete={() => this.onDelete(index)}
              file={image}
            />
          </div>
        )}

        <Button
          icon='plus'
          text='Add Image'
        >
            <FileInput
              fetchUpload={fetchUpload}
              onChange={(image) => this.newImage(image)}
            />
        </Button>
      </div>
    )
  }
}
