import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ImageEdit, ImageContainer } from 'client/components/image/image_edit'
import { Modal } from 'client/components/modal/modal'

export class ImagesEdit extends Component {
  static propTypes = {
    fetchUpload: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    setEditing: PropTypes.func.isRequired
  }

  onChangeImage = (image, index) => {
    const { item, onChange } = this.props
    const images = item.images || []

    images[index] = image
    onChange(images)
  }

  onNewImage = (image) => {
    const { item, onChange } = this.props
    const images = item.images || []

    images.push(image)
    onChange(images)
    this.forceUpdate()
  }

  onDeleteImage = (index) => {
    const { item, onChange } = this.props
    const images = item.images || []

    if (images.length === 1) {
      onChange([])
    } else {
      images.splice(index, 1)
      onChange(images)
    }
  }

  render () {
    const { item, fetchUpload, setEditing } = this.props
    const images = item.images || []

    return (
      <Modal onClick={() => setEditing(null)}>

        <div>
          <label>Images</label>

          {images.length > 0 &&
            <ImagesEditList>
              {images.map((image, index) =>
                <ImageEdit
                  index={index}
                  item={image}
                  key={index}
                  onChange={this.onChangeImage}
                  onDelete={this.onDeleteImage}
                  editCaption
                />
              )}
            </ImagesEditList>
          }

          <div>
            <ImageEdit
              fetchUpload={fetchUpload}
              index={-1}
              item={{}}
              onChange={this.onNewImage}
              showInput
            />
          </div>

        </div>
      </Modal>
    )
  }
}

const ImagesEditList = styled.div`
  display: flex;
  justify-content: space-around;

  ${ImageContainer} {
    max-width: 35%;
    padding-bottom: 20px;
  }
`