import styled from 'styled-components'
import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../forms/buttons/button.jsx'
import { FileInput } from '../forms/file_input/index.jsx'
import { Image } from './image.jsx'
import { RichText } from '../forms/rich_text/index.jsx'

export class ImageEdit extends Component {
  static propTypes = {
    className: PropTypes.string,
    editCaption: PropTypes.bool,
    fetchUpload: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    index: PropTypes.number,
    item: PropTypes.object,
    showInput: PropTypes.bool
  }

  constructor (props) {
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

  onChangeImage = item => {
    const { index, onChange } = this.props

    this.setState({ item: item })
    onChange(item, index)
  }

  onChangeText = caption => {
    const { index, item } = this.props
    let newImage = clone(item)

    newImage.caption = caption
    this.onChangeImage(newImage, index)
  }

  onDeleteImage = () => {
    const { index, onChange, onDelete } = this.props

    if (onDelete) {
      onDelete(index)
    } else {
      onChange()
    }
  }

  editCaption = () => {
    const { caption } = this.state.item

    return (
      <RichText
        onChange={this.onChangeText}
        html={caption}
        className='p'
        placeholder='Image Caption'
      />
    )
  }

  render () {
    const {
      className,
      editCaption,
      index,
      fetchUpload,
      showInput
    } = this.props

    const { item } = this.state

    const {
      caption,
      url
    } = item

    return (
      <div className={className || ''}>
        {showInput
          ? (
            <FileInput
              hasPreview={index !== -1}
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChangeImage(image, index)}
              onDelete={() => this.onDeleteImage()}
              file={item}
            />
          ) : (
            <ImageContainer>
              <Button
                icon='times'
                onClick={this.onDeleteImage}
              />
              <Image
                url={url}
                caption={!editCaption && caption || ''}
                editCaption={editCaption && this.editCaption()}
              />
            </ImageContainer>
          )
        }
      </div>
    )
  }
}

const ImageContainer = styled.div`
  position: relative;
  button {
    position: absolute;
    right: -5px;
    top: -5px;
    padding: 4px 8px;
    &:hover {
      color: red;
    }
  }
`
