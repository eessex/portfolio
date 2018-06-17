import PropTypes from 'prop-types'
import React, { Component } from 'react'

const States = [
  '', 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export class SelectInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    required: PropTypes.bool,
    states: PropTypes.bool,
    value: PropTypes.any
  }

  renderLabel = () => {
    const { label, name } = this.props

    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{name}</label>
    }
  }

  renderOptions = options => {
    if (this.props.states) { options = States }

    const renderOptions = options.map((value, i) =>
      <option key={i} value={value}>{value}</option>
    )
    return renderOptions
  }

  renderInput () {
    const { name, value, required, options, onChange } = this.props

    return (
      <select
        required={required || false}
        name={name}
        defaultValue={value}
        onChange={(e) => onChange(name, e.target.value)} >
        {this.renderOptions(options)}
      </select>
    )
  }

  render () {
    // const { required, label } = this.props

    // TODO: Required indicators
    // var group = label ? ' input-group' : ''
    // var req = required ? ' req' : ''

    return (
      <div>
        {this.renderLabel()}
        {this.renderInput()}
      </div>
    )
  }
}
