import { clone } from 'lodash'
import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { FileInput } from 'client/components/FileInput'
import { RichText } from 'client/components/text/draft/RichText'
import { Image, Caption, ImageContainer } from './image'
import { Image as ImageType } from 'client/typings'

interface ImageEditProps {
  editCaption?: boolean
  fetchUpload?: () => void
  getTrueIndex?: () => void
  onChange: (image?: ImageType, index?: number) => void
  onDelete?: (index: number) => void
  index: number
  image?: ImageType
  showInput?: boolean
}

interface ImageEditState {
  image: ImageType
}

export class ImageEdit extends Component<ImageEditProps, ImageEditState> {
  constructor (props) {
    super(props)
    const image = props.image || {}

    this.state = {
      image: {
        aspect: image.aspect,
        caption: image.caption,
        url: image.url || undefined
      }
    }
  }

  onChangeImage = (image: ImageType) => {
    const { index, onChange } = this.props

    this.setState({ image })
    onChange(image, index)
  }

  onChangeText = (caption: string) => {
    const { image } = this.props
    let newImage = clone(image)

    newImage.caption = caption
    this.onChangeImage(newImage)
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
    const { caption } = this.state.image

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

    const { image } = this.state

    const {
      caption,
      url
    } = image

    return (
      <div>
        {showInput
          ? (
            <FileInput
              hasPreview={index !== -1}
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChangeImage(image)}
              onDelete={() => this.onDeleteImage()}
              file={image}
            />
          ) : (
            <ImageContainer>
              <Button
                icon='times'
                onClick={this.onDeleteImage}
              />
              <Image
                url={url || ''}
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
