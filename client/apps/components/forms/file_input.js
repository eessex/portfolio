import React, { Component } from 'react'
import axios from 'axios'

class FileInput extends Component {
  constructor(props) {
    super(props)
    this.fetchSignature = this.fetchSignature.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  uploadFile(data, signature, onChange) {
    axios.put(signature.signedRequest, data, { headers: {
          'Content-Type': data.type
        }
      })
      .then(res =>
        onChange(res, signature.url)
      ).catch(error =>
        console.log(error)
      ).bind(this)
  }
  onChange(res, url) {
    this.props.onChange(this.props.name, url)
  }

  fetchSignature(e) {
    this.props.actions.fetchUpload(
      e.target.files[0],
      e.target.value,
      this.uploadFile,
      this.onChange
    )
  }

  renderLabel(label) {
    if (label) {
      return (
        <label>
          {label.length > 0 ? label : this.props.name}
        </label>
      )
    }
  }

  render() {
    const { name, value, label, accept } = this.props
    const group = label ? ' input-group' : ''
    return (
      <div className={'input--check' + group}>
        {this.renderLabel(label)}
        <input
          ref='file'
          type='file'
          accept={accept}
          onChange={this.fetchSignature} />
      </div>
    )
  }
}

export default FileInput
