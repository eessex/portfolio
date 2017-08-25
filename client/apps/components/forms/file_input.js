import React, { Component } from 'react';
// import { fetchUpload } from '../../../actions/upload'


class FileInput extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    // fetchUpload(e.target.files[0])
    debugger
    // this.props.onChange(this.props.name, e.target.value)
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
          type='file'
          accept={accept}
          onChange={this.onChange} />
      </div>
    );
  }
}

export default FileInput;