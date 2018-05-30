import PropTypes from 'prop-types'
import React, { Component } from 'react'

class TextInput extends Component {
  static propTypes = {
    index: PropTypes.number,
    label: PropTypes.string,
    maxLength: PropTypes.number,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    size: PropTypes.any,
    textarea: PropTypes.bool,
    value: PropTypes.string
  }

  onKeyUp = (e) => {
    const { index, name, onChange } = this.props

    if (index || index === 0) {
      onChange(name, e.target.value, index)
    } else {
      onChange(name, e.target.value)
    }
  }

  renderLabel = () => {
    const { label } = this.props

    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  renderPlaceholder (name) {
    if (this.props.placeholder) {
      name = this.props.placeholder
    } else {
      name = name.replace(/-/g, ' ').replace(/_/g, ' ')
    }
    return name
  }

  renderInput = () => {
    const { name, value, required, textarea, maxLength, size } = this.props
    if (textarea) {
      return (
        <textarea
          required={required || false}
          placeholder={this.renderPlaceholder(name)}
          name={name}
          size={size}
          maxLength={maxLength}
          defaultValue={value}
          onKeyUp={this.onKeyUp}
        />
      )
    } else {
      return (
        <input
          required={required || false}
          placeholder={this.renderPlaceholder(name)}
          name={name}
          size={size}
          maxLength={maxLength}
          defaultValue={value}
          onKeyUp={this.onKeyUp}
        />
      )
    }
  }

  render () {
    const { required, label } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--text' + req + group}>
        {this.renderLabel()}
        {this.renderInput()}
      </div>
    );
  }
}

export default TextInput
