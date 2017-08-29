import React, { Component } from 'react';
import axios from 'axios'


class FileInput extends Component {
  constructor(props) {
    super(props);
    this.fetchSignature = this.fetchSignature.bind(this)
  }

  uploadFile(data, signature) {
    axios.put(signature.signedRequest, data)
      .then(res =>
        this.onChange(res)
      ).catch(error =>
        console.log(error)
      )
  }
  onChange(file) {
    debugger
    // this.props.onChange(key, value)
  }

  fetchSignature(e) {
    this.props.actions.fetchUpload(e.target.files[0], e.target.value, this.uploadFile)
  }

  renderLabel(label) {
    if (label) {
      return <label>{label.length > 0 ? label : this.props.name}</label>
    }
  }

  render() {
    const { name, value, label, accept } = this.props

    var group = label ? ' input-group' : ''

    return (
      <div className={'input--check' + group}>
        {this.renderLabel(label)}
        <input
          ref='file'
          type='file'
          accept={accept}
          onChange={this.fetchSignature} />
      </div>
    );
  }
}

export default FileInput;