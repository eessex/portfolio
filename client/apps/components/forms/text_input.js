import React, { Component } from 'react';

class TextInput extends Component {
  constructor(props) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onKeyUp(e) {
    this.props.onChange(this.props.name, e.target.value)
  }

  renderLabel(label) {
    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  render() {
    const { name, value, required, label } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--text' + req + group}>
        {this.renderLabel(label)}
        <input
          required={required || false}
          placeholder={name}
          defaultValue={value}
          onKeyUp={this.onKeyUp} />
      </div>
    );
  }
}

export default TextInput;