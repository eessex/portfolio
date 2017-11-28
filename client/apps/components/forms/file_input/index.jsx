import axios from 'axios'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from'../buttons/button.jsx'
require('./index.scss')

export class FileInput extends Component {
  static propTypes = {
    accept: PropTypes.string,
    hasPreview: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    file: PropTypes.object
  }

  state = {
    isDragOver: true,
    loading: false
  }

  static defaultProps = {
    file: {
      url: ''
    }
  }

  uploadFile = (data, signature ) => {
    const { file, onChange } = this.props
    const { signedRequest, url } = signature

    axios.put(signedRequest, data, {
      headers: {
          'Content-Type': data.type
        }
      }
    )
      .then(res => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          const aspect = img.width / img.height
          const newImage = {
            url,
            aspect
          }
          onChange(newImage)
          this.setState({ loading: false })
        }
      }
      ).catch(error =>
        console.log(error)
      ).bind(this)
  }

  toggleDragOver = (isDragover) => {
    this.setState({ isDragover })
  }

  fetchSignature = (e) => {
    const { fetchUpload } = this.props
    const { files, file } = e.target

    fetchUpload(
      files[0],
      file,
      this.uploadFile
    )
    this.setState({ loading: true })
  }

  renderPreview = (file) => {
    if (file && file.url) {
      if (file.url.includes('mp4')) {
        return <video src={file.url} />

      } else {
        return (
          <div className='FileInput__preview-img'>
            <img src={file.url} />
            <Button
              icon='times'
              onClick={this.props.onDelete}
            />
          </div>
        )
      }
    }
  }

  render () {
    const { accept, file, hasPreview, index, label } = this.props
    const { isDragOver } = this.state

    return (
      <div className='FileInput'>
        {label &&
          <label>{label}</label>
        }
        <div
          className='FileInput__drag-zone'
          data-drag-over={isDragOver}
          onDragEnter={() => toggleDragOver(true)}
          onDragLeave={() => toggleDragOver(false)}
          ref={div => {this.fileContainer = div}}
          style={{
            opacity: hasPreview && file.url ? 1 : .7,
            borderWidth: hasPreview && file.url ? 0 : '1px'
          }}
        >
          {hasPreview && this.renderPreview(file)}

          <div className='FileInput__input'>
            {!file.url &&
              <h5>Click or Drag to Upload</h5>
            }

            <input
              type='file'
              accept={accept || 'image/*, video/mp4'}
              onChange={this.fetchSignature}
            />
          </div>
        </div>
      </div>
    )
  }
}
