import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { CheckboxInput } from '../forms/checkbox_input.jsx'
import { DateInput } from '../forms/date_input.jsx'

export class DatesEdit extends Component {
  state = {
    allDay: this.props.all_day ? true : false,
    hasEndDate: this.props.end_date ? true : false,
  }

  toggleAllDay = () => {
    const { all_day } = this.state
    const { onChange } = this.props

    onChange('all_day', !all_day)
    this.setState({ all_day: !all_day })
  }

  toggleEndDate = () => {
    const { hasEndDate } = this.state
    const { onChange } = this.props

    if (hasEndDate) {
      onChange('end_date', null)
    }
    this.setState({ hasEndDate: !hasEndDate })
  }

  render() {
    const {
      all_day,
      end_date,
      onChange,
      start_date
    } = this.props

    const {
      hasEndDate
    } = this.state

    return (
      <div className='DatesEdit'>

        <Row className='DatesEdit__dates'>
          <Col>
            <DateInput
              label='Start Date'
              value={start_date || new Date}
              required={true}
              allDay={all_day}
              onChange={(date) => onChange('start_date', date)}
              autoFocus
            />
          </Col>

          {hasEndDate &&
            <Col>
              <DateInput
                label='End Date'
                value={end_date || null}
                allDay={all_day}
                onChange={(date) => onChange('end_date', date)}
              />
            </Col>
          }
        </Row>

        <div className='DatesEdit__check-inputs'>
          <CheckboxInput
            className='h5'
            label='Hide End Date'
            name='end_date'
            value={!hasEndDate}
            onChange={this.toggleEndDate}
          />
          <CheckboxInput
            className='h5'
            label='Hide Time'
            name='all_day'
            value={all_day}
            onChange={() => onChange('all_day', !all_day)}
          />
        </div>

      </div>
    )
  }
}

