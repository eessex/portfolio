import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Button } from '../forms/buttons/button.jsx'
import { ImageEdit } from '../image/image_edit.jsx'
import { ModalContainer } from '../modal/modal_container.jsx'

export class ImagesEdit extends Component {
  static propTypes = {
    fetchUpload: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    setEditing: PropTypes.func.isRequired
  }

  onChangeImage = (image, index) => {
    const { onChange, item } = this.props
    const images = this.props.item.images || []

    images[index] = image
    onChange(images)
  }

  onNewImage = (image) => {
    const { onChange } = this.props
    const images = this.props.item.images || []

    images.push(image)
    onChange(images)
    this.forceUpdate()
  }

  onDeleteImage = (index) => {
    const { onChange, item } = this.props
    const images = item.images || []
    debugger
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
            <div className='ImagesEdit__list'>
              {images.map((image, index) =>
                <ImageEdit
                  fetchUpload={fetchUpload}
                  index={index}
                  item={image}
                  key={index}
                  onChange={this.onChangeImage}
                  onDelete={this.onDeleteImage}
                />
              )}
            </div>
          }

          <div className='ImagesEdit__new'>
            <ImageEdit
              fetchUpload={fetchUpload}
              index={-1}
              item={{}}
              onChange={this.onNewImage}
            />
          </div>

        </div>
      </ModalContainer>
    )
  }
}
