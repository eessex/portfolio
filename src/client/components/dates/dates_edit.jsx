import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { CheckboxInput } from 'client/components/forms/checkbox_input'
import { DateInput } from 'client/components/forms/date_input'

export class DatesEdit extends Component {
  static propTypes = {
    all_day: PropTypes.bool,
    end_date: PropTypes.string,
    onChange: PropTypes.func,
    start_date: PropTypes.string
  }

  state = {
    allDay: this.props.all_day === true,
    hasEndDate: this.props.end_date !== null
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

  render () {
    const {
      all_day,
      end_date,
      onChange,
      start_date
    } = this.props

    const { hasEndDate } = this.state

    return (
      <DatesEditContainer>
        <Row>
          <Col>
            <DateInput
              label='Start Date'
              value={start_date || new Date()}
              required
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

        <Row>
          <Col>
            <CheckboxInput
              label='Hide End Date'
              name='end_date'
              value={!hasEndDate}
              onChange={this.toggleEndDate}
            />
          </Col>
          <Col>
            <CheckboxInput
              label='Hide Time'
              name='all_day'
              value={all_day}
              onChange={() => onChange('all_day', !all_day)}
            />
          </Col>
        </Row>
      </DatesEditContainer>
    )
  }
}

const DatesEditContainer = styled.div`
  ${Row} {
    padding-bottom: 10px;
    ${Col} {
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
  }
  input {
    border: none;
    border-bottom: 1px solid #ddd;
    font-size: .9em;
    padding-bottom: 2px;
    font-family: inherit;
  }
`
