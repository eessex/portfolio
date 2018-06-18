import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'
import { Input } from '../../styles/forms.jsx'

export class DateInput extends Component {
  static date
  static time

  static propTypes = {
    autoFocus: PropTypes.bool,
    allDay: PropTypes.bool,
    label: PropTypes.string,
    required: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.any
  }

  onKeyUp = () => {
    const { onChange } = this.props
    if (this.date && this.time) {
      const newDate = this.date.value
      const newTime = this.time.value || ''
      const formattedDate = moment(newDate + ' ' + newTime).toISOString()

      onChange(formattedDate)
    }
  }

  render () {
    const {
      autoFocus,
      allDay,
      label,
      value,
      required
    } = this.props

    // TODO: Required indicators

    // var group = label ? ' input-group' : ''
    // var req = required ? ' req' : ''

    return (
      <div>
        {label &&
          <Label required={required}>
            {label}
          </Label>
        }
        <Input
          type='date'
          innerRef={(ref) => { this.date = ref }}
          required={required || false}
          defaultValue={moment(value).format('YYYY-MM-DD')}
          onKeyUp={this.onKeyUp}
          autoFocus={autoFocus}
        />
        {!allDay &&
          <Input
            type='time'
            innerRef={(ref) => { this.time = ref }}
            defaultValue={moment(value).format('HH:mm')}
            onKeyUp={this.onKeyUp}
          />
        }
      </div>
    )
  }
}

const Label = styled.label`
  ${props => props.required && `
    &::after {
      content: '*';
      color: red;
      margin-left: 5px;
      font-size: .75em;
      vertical-align: super;
    }
  `}
`
