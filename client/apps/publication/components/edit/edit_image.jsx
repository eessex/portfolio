import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { FileInput } from '../../../../components/forms/file_input/index.jsx'

export class EditImage extends Component {
  static propTypes = {
    fetchUpload: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    index: PropTypes.number,
    item: PropTypes.object
  }

  constructor(props) {
    super(props)
    const {
      aspect,
      caption,
      url
    } = props.item

    this.state = {
      item: {
        aspect: aspect || null,
        caption: caption || '',
        url: url || false
      }
    }
  }

  onChangeImage = (image) => {
    const { index, item, onChange } = this.props

    this.setState({ item: image })
    onChange(image, index)
  }

  onDeleteImage = () => {
    const { index, onDelete } = this.props

    if (onDelete) {
      onDelete(index)
    }
  }

  render () {
    const { index, fetchUpload, onDelete } = this.props
    const { item } = this.state
    const {
      aspect,
      caption,
      url
    } = item

    return (
      <div className='EditImage'>
        <FileInput
          hasPreview={index !== -1}
          fetchUpload={fetchUpload}
          onChange={(image) => this.onChangeImage(image, index)}
          onDelete={() => this.onDeleteImage()}
          file={item}
        />
      </div>
    )
  }
}
