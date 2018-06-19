import moment from 'moment'
import { mount } from 'enzyme'
import React from 'react'
import { DatesEdit } from '../dates_edit'
import { DateInput } from 'client/components/forms/date_input'

describe('DatesEdit', () => {
  const getElement = props => {
    return mount(
      <DatesEdit {...props} />
    )
  }

  let props = {}
  let date

  beforeEach(() => {
    date = '2018-05-02T23:00:00.000Z'
    props = {
      all_day: false,
      end_date: moment(date).add(1, 'day').toISOString(),
      onChange: jest.fn(),
      start_date: date
    }
  })

  it('renders a start_date input with data', () => {
    const component = getElement(props)
    const input = component.find('input').at(0).getElement().props

    expect(input.type).toBe('date')
    expect(input.defaultValue).toBe('2018-05-02')
  })

  it('renders a start_time input with data', () => {
    const component = getElement(props)
    const input = component.find('input').at(1).getElement().props

    expect(input.type).toBe('time')
    expect(input.defaultValue).toBe('19:00')
  })

  it('renders hide end_date checkbox checked by default', () => {
    const component = getElement(props)
    const input = component.find('input').at(2).getElement().props

    expect(input.type).toBe('checkbox')
    expect(input.defaultChecked).toBe(true)
  })

  it('renders all_day checkbox unchecked by default', () => {
    const component = getElement(props)
    const input = component.find('input').at(3).getElement().props

    expect(input.type).toBe('checkbox')
    expect(input.defaultChecked).toBe(false)
  })

  describe('editing', () => {
    it('can change start_date', () => {
      const component = getElement(props)
      const input = component.find(DateInput).at(0).instance()
      input.date.value = '2018-05-03'
      input.onKeyUp()

      const onChange = props.onChange.mock.calls[0]
      expect(onChange[0]).toBe('start_date')
      expect(onChange[1]).toMatch('2018-05-03')
    })
  })
})
