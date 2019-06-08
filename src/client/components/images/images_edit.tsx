import styled from 'styled-components'
import React, { Component } from 'react'
import { ImageEdit } from 'client/components/image/image_edit'
import { ImageContainer } from 'client/components/image/image'
import { Modal } from 'client/components/modal/modal'
import { ImageGrid } from './image_grid/image_grid'
import { Item, Image } from 'client/typings'


interface ImagesEditProps {
  fetchUpload: () => void
  onChange: (images: Image[]) => void
  item: Item
  setEditing: (editing: string | null) => void
}

export class ImagesEdit extends Component<ImagesEditProps> {
  onChangeImage = (image, index) => {
    const { item, onChange } = this.props
    const images = item.images || []

    images[index] = image
    onChange(images)
  }

  onNewImage = image => {
    const { item, onChange } = this.props
    const images = item.images || []

    images.push(image)
    onChange(images)
  }

  onDeleteImage = index => {
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
              <ImageGrid
                fetchUpload={fetchUpload}
                images={images}
                onChange={this.onChangeImage}
                onDelete={this.onDeleteImage}
              />
            </ImagesEditList>
          }
          {images.length < 9 &&
            <div>
              <ImageEdit
                fetchUpload={fetchUpload}
                index={-1}
                onChange={this.onNewImage}
                showInput
              />
            </div>
          }

        </div>
      </Modal>
    )
  }
}

const ImagesEditList = styled.div`
  display: flex;
  justify-content: space-around;

  ${ImageContainer} {
    padding-bottom: 20px;
  }
`
