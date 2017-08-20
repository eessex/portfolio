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

  renderPlaceholder(name) {
    if (this.props.placeholder) {
      name = this.props.placeholder
    } else {
      name = name.replace(/-/g, ' ').replace(/_/g, ' ')
    }
    return name
  }

  renderInput() {
    const { name, value, required, textarea } = this.props
    if (textarea) {
      return (
        <textarea
          required={required || false}
          placeholder={this.renderPlaceholder(name)}
          name={name}
          defaultValue={value}
          onKeyUp={this.onKeyUp} />
      )
    } else {
      return (
        <input
          required={required || false}
          placeholder={this.renderPlaceholder(name)}
          name={name}
          defaultValue={value}
          onKeyUp={this.onKeyUp} />
      )
    }
  }

  render() {
    const { required, label } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--text' + req + group}>
        {this.renderLabel(label)}
        {this.renderInput()}
      </div>
    );
  }
}

export default TextInput;