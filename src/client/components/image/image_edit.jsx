import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { FileInput } from 'client/components/forms/file_input'
import { RichText } from 'client/components/text/draft/RichText'
import { Image, Caption, ImageContainer } from './image'

export class ImageEdit extends Component {
  static propTypes = {
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

    this.setState({ item })
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
      <Caption>
        <RichText
          onChange={this.onChangeText}
          html={caption}
          placeholder='Image Caption'
        />
      </Caption>
    )
  }

  render () {
    const {
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
      <div>
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
