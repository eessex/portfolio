// <input type="file" id="file-input">

import React, { Component } from 'react';
import { fetchSignature } from '../../../actions/upload'


class FileInput extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
  	debugger
    const sig = fetchSignature()
    debugger
    // this.props.actions.fetchSignature()
    // this.props.onChange(this.props.name, e.target.value)
  }

  renderLabel(label) {
    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  render() {
    const { name, value, label, accept } = this.props

    var group = label ? ' input-group' : ''

    return (
      <div className={'input--check' + group}>
        {this.renderLabel(label)}
        <input
          type='file'
          accept={accept}
          onChange={this.onChange} />
      </div>
    );
  }
}

export default FileInput;