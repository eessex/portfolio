import React, { Component } from 'react'

const States = [
  '', 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI',
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

interface SelectProps {
  label?: string
  name: string
  onChange: (name: string, val: any) => void
  options: any[]
  required?: boolean
  states?: boolean
  value: any
}

export class Select extends Component<SelectProps> {
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
        onChange={e => onChange(name, e.target.value)}
      >
        {this.renderOptions(options)}
      </select>
    )
  }

  render () {
    return (
      <React.Fragment>
        {this.renderLabel()}
        {this.renderInput()}
      </React.Fragment>
    )
  }
}
