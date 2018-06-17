import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'

export class DateInput extends Component {
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
    const { date, time } = this.refs

    const newDate = date.value
    const newTime = time ? time.value : ''
    const formattedDate = moment(newDate + ' ' + newTime).toISOString()

    onChange(formattedDate)
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
          <label>{label}</label>
        }
        <input
          type='date'
          ref='date'
          required={required || false}
          defaultValue={moment(value).format('YYYY-MM-DD')}
          onKeyUp={this.onKeyUp}
          autoFocus={autoFocus}
        />
        {!allDay &&
          <input
            type='time'
            ref='time'
            defaultValue={moment(value).format('HH:mm')}
            onKeyUp={this.onKeyUp}
          />
        }
      </div>
    )
  }
}
