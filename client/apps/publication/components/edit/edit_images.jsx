import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Button } from '../../../../components/forms/buttons/button.jsx'
import { EditImage } from './edit_image.jsx'
import { ModalContainer } from '../../../../components/modal/modal_container.jsx'

export class EditImages extends Component {
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
    const { onChange } = this.props
    const images = this.props.item.images || []

    if (images.length === 1) {
      onChange([])
    } else {
      onChange(images)
    }
  }

  render () {
    const { item, fetchUpload, setEditing } = this.props
    const images = item.images || []

    return (
      <ModalContainer className='EditImages' onClick={() => setEditing(null)}>
        <div className='EditImages__inner'>
          <label>Images:</label>
          <div className='EditImages__list'>
            {images.length > 0 && images.map((image, index) =>
              <EditImage
                fetchUpload={fetchUpload}
                index={index}
                item={image}
                key={index}
                onChange={this.onChangeImage}
                onDelete={this.onDeleteImage}
              />
            )}
          </div>
          <div className='EditImages__new'>
            <EditImage
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
