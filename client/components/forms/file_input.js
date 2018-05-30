import PropTypes from 'prop-types'
import React, { Component } from 'react'
import axios from 'axios'

export class FileInput extends Component {
  static propTypes = {
    accept: PropTypes.array,
    fetchUpload: PropTypes.func,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func
  }

  uploadFile = (data, signature, onChange) => {
    axios.put(
      signature.signedRequest,
      data,
      {
        headers: {
          'Content-Type': data.type
        }
      }
    )
      .then(res =>
        onChange(res, signature.url)
      ).catch(error =>
        console.log(error)
      ).bind(this)
  }
  onChange = (res, url) => {
    const { name, onChange } = this.props
    onChange(name, url)
  }

  fetchSignature = (e) => {
    this.props.fetchUpload(
      e.target.files[0],
      e.target.value,
      this.uploadFile,
      this.onChange
    )
  }

  renderLabel = () => {
    const { label } = this.props

    if (label) {
      return (
        <label>
          {label.length > 0 ? label : this.props.name}
        </label>
      )
    }
  }

  render () {
    const { label, accept } = this.props
    const group = label ? ' input-group' : ''

    return (
      <div className={'input--file' + group}>
        {this.renderLabel()}
        <input
          ref='file'
          type='file'
          accept={accept}
          onChange={this.fetchSignature} />
      </div>
    )
  }
}
