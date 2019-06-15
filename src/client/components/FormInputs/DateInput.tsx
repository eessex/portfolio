import styled from 'styled-components'
import React, { Component } from 'react'
import moment from 'moment'
import { Input } from 'client/styles/forms'

interface DateInputProps {
  autoFocus?: boolean
  allDay: boolean
  label?: string
  onChange: (date: string) => void
  required?: boolean
  value?: string | Date
}

export class DateInput extends Component<DateInputProps> {
  public date
  public time

  onKeyUp = () => {
    const { onChange } = this.props
    if (this.date && this.time) {
      const newDate = this.date.value
      const newTime = this.time.value || ''
      // TODO: Investigate local
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

    return (
      <div>
        {label &&
          <Label required={required}>
            {label}
          </Label>
        }
        <Input
          type='date'
          ref={ref => { this.date = ref }}
          required={required || false}
          defaultValue={moment(value).format('YYYY-MM-DD')}
          onKeyUp={this.onKeyUp}
          autoFocus={autoFocus}
        />
        {!allDay &&
          <Input
            type='time'
            ref={ref => { this.time = ref }}
            defaultValue={moment(value).format('HH:mm')}
            onKeyUp={this.onKeyUp}
          />
        }
      </div>
    )
  }
}

const Label = styled.label<{ required: boolean }>`
  ${({ required }) => required && `
    &::after {
      content: '*';
      color: red;
      margin-left: 5px;
      font-size: .75em;
      vertical-align: super;
      position: absolute;
    }
  `}
`
