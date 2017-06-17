import React, { Component } from 'react';

class CheckboxInput extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(this.props.name, e.target.checked)
  }

  renderLabel(label) {
    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  render() {
    const { name, value, label } = this.props

    var group = label ? ' input-group' : ''

    return (
      <div className={'input--check' + group}>
        {this.renderLabel(label)}
        <input
          type='checkbox'
          defaultChecked={value}
          onChange={this.onChange} />
      </div>
    );
  }
}

export default CheckboxInput;