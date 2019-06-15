import styled from 'styled-components'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Checkbox } from 'client/components/FormInputs/Checkbox'
import { DateInput } from 'client/components/FormInputs/DateInput'

export interface DatesEditProps {
  all_day?: boolean,
  end_date: string | Date,
  onChange: (key: string, val: any) => void
  start_date: string | Date
}

interface DatesEditState {
  allDay: boolean
  hasEndDate: boolean
}

export class DatesEdit extends Component<DatesEditProps, DatesEditState> {
  state = {
    allDay: this.props.all_day === true,
    hasEndDate: this.props.end_date !== null
  }

  toggleAllDay = () => {
    const { allDay } = this.state
    const { onChange } = this.props

    onChange('all_day', !allDay)
    this.setState({ allDay: !allDay })
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
      end_date,
      onChange,
      start_date
    } = this.props

    const { allDay, hasEndDate } = this.state

    return (
      <DatesEditContainer>
        <Row>
          <Col>
            <DateInput
              label='Start Date'
              value={start_date || new Date()}
              required
              allDay={allDay}
              onChange={(date) => onChange('start_date', date)}
              autoFocus
            />
          </Col>

          {hasEndDate &&
            <Col>
              <DateInput
                label='End Date'
                value={end_date || null}
                allDay={allDay}
                onChange={(date) => onChange('end_date', date)}
              />
            </Col>
          }
        </Row>

        <Row>
          <Col>
            <Checkbox
              label='Hide End Date'
              value={!hasEndDate}
              onChange={this.toggleEndDate}
            />
          </Col>
          <Col>
            <Checkbox
              label='Hide Time'
              value={allDay}
              onChange={() => onChange('all_day', !allDay)}
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
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
    font-size: .9em;
    padding-bottom: 2px;
    font-family: inherit;
  }
`
