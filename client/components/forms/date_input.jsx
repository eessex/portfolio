import React, { Component } from 'react'
import moment from 'moment'

export class DateInput extends Component {
  onKeyUp = () => {
    const { onChange } = this.props
    const { date, time } = this.refs

    const newDate = date.value
    const newTime = time ? time.value : ''
    const formattedDate = moment(newDate + ' ' + newTime).toISOString()

    onChange(formattedDate)
  }

  render() {
    const {
      allDay,
      label,
      value,
      required
    } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--date' + req + group}>
        {label &&
          <label>{label}</label>
        }

        <input
          type='date'
          ref='date'
          required={required || false}
          defaultValue={moment(value).format('YYYY-MM-DD')}
          onKeyUp={this.onKeyUp}
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