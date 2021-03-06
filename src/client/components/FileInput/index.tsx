import axios from 'axios'
import styled from 'styled-components'
import React, { Component } from 'react'
import { Button } from 'client/components/Button'
import { H5 } from 'client/styles/text'
import { Loading } from 'client/components/Loading'

interface FileInputProps {
  accept?: string,
  fetchUpload:(files: any, file: any, cb: any) => void
  hasPreview?: boolean
  label?: string,
  onChange: (image: any) => void
  onDelete?: () => void
  file?: any
}

interface FileInputState {
  fileUrl?: string
  isDragOver: boolean
  loading: boolean
}

export class FileInput extends Component<FileInputProps, FileInputState> {
  state = {
    isDragOver: false,
    loading: false
  }

  public fileContainer

  onChangeImage = newImage => {
    const { onChange, hasPreview } = this.props

    onChange(newImage)
    this.setState({
      loading: false,
      fileUrl: !hasPreview && ''
    })
  }

  uploadFile = async (data, signature) => {
    try {
      const { signedRequest, url } = await signature.data
      axios.put(
        signedRequest,
        data,
        {
          headers: {
            'Content-Type': data.type
          },
          // crossDomain: true
        }
      ).then(() => {
        const img = new Image()
        img.src = url || ''

        img.onload = () => {
          const aspect = img.width / img.height
          const newImage = {
            url,
            aspect,
            caption: ''
          }
          this.onChangeImage(newImage)
          return newImage
        }
      }).catch(err => {
        console.error(err)
      })
    } catch (err) {
      console.error(err)
    }
  }

  toggleDragOver = isDragOver => {
    this.setState({ isDragOver })
  }

  fetchSignature = e => {
    const { fetchUpload } = this.props
    const { files, file } = e.target

    fetchUpload(
      files[0],
      file,
      this.uploadFile.bind(this)
    )
    this.setState({ loading: true })
  }

  renderPreview = file => {
    if (file && file.url) {
      if (file.url.includes('mp4')) {
        return (
          <video src={file.url} />
        )
      } else {
        return (
          <Preview>
            <img src={file.url} />
            <Button
              icon='times'
              onClick={this.props.onDelete}
            />
          </Preview>
        )
      }
    }
  }

  render () {
    const { accept, file, hasPreview, label } = this.props
    const { isDragOver, loading } = this.state

    return (
      <FileInputContainer>
        {label &&
          <label>{label}</label>
        }
        <DragZone
          data-drag-over={isDragOver}
          onDragEnter={() => this.toggleDragOver(true)}
          onDragLeave={() => this.toggleDragOver(false)}
          ref={div => (this.fileContainer = div)}
          style={{
            opacity: hasPreview && file.url ? 1 : 0.7,
            borderWidth: hasPreview && file.url ? 0 : '1px'
          }}
        >
          {hasPreview && this.renderPreview(file)}

          <Input>
            {loading
              ? <Loading isAbsolute />
              : <div>
                {(hasPreview && !file.url) || (!hasPreview) &&
                  <H5>Click or Drag to Upload</H5>
                }

                <input
                  type='file'
                  accept={accept || 'image/*, video/mp4'}
                  onChange={this.fetchSignature}
                />
              </div>
            }
          </Input>
        </DragZone>
      </FileInputContainer>
    )
  }
}

const FileInputContainer = styled.div`
  position: relative;
  width: 100%;
`

export const DragZone = styled.div`
  width: 100%;
  min-width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaeaea;
  color: #aaa;
  border: 1px dashed #aaa;
  opacity: .7;
  transition: opacity .5s;
  &:hover {
    opacity: 1;
  }
`

const Input = styled.div`
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 100%;
  input {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
    min-width: 100%;
  }
`

const Preview = styled.div`
  img {
    max-width: 100%;
    display: block;
  }
  button {
    position: absolute;
    right: -3px;
    top: -3px;
    z-index: 10;
    padding: 2px 5px;
    font-size: 1em;
    &:hover {
      color: red;
    }
  }
`
