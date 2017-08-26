import React, { Component } from 'react';

const States = [
  '', 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

class SelectInput extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(this.props.name, e.target.value)
  }

  renderLabel(label) {
    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  renderOptions(options) {
    if (this.props.states) { options = States }
    const renderOptions = options.map((value, i) =>
      <option key={i} value={value}>{value}</option>
    )
    return renderOptions
  }

  renderInput() {
    const { name, value, required, options} = this.props
    return (
      <select
        required={required || false}
        name={name}
        defaultValue={value}
        onChange={this.onChange} >
        {this.renderOptions(options)}
      </select>
    )
  }

  render() {
    const { required, label } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--select' + req + group}>
        {this.renderLabel(label)}
        {this.renderInput()}
      </div>
    );
  }
}

export default SelectInput;
