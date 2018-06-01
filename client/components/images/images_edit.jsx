import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ImageEdit, ImageContainer } from '../image/image_edit.jsx'
import { ModalContainer } from '../modal/modal_container.jsx'

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
      <ModalContainer className='ImagesEdit' onClick={() => setEditing(null)}>

        <div className='ImagesEdit__inner'>
          <label>Images:</label>

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

          <div className='ImagesEdit__new'>
            <ImageEdit
              fetchUpload={fetchUpload}
              index={-1}
              item={{}}
              onChange={this.onNewImage}
              showInput
            />
          </div>

        </div>
      </ModalContainer>
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
