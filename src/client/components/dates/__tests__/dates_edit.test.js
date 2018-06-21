import { mount } from 'enzyme'
import React from 'react'
import { DatesEdit } from '../dates_edit'
import { CheckboxInput } from 'client/components/forms/checkbox_input'
import { DateInput } from 'client/components/forms/date_input'

describe('DatesEdit', () => {
  const getElement = props => {
    return mount(
      <DatesEdit {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      all_day: false,
      end_date: null,
      onChange: jest.fn(),
      start_date: '2018-05-02T23:00:00.000Z'
    }
  })

  describe('hide end date', () => {
    it('is checked by default', () => {
      const component = getElement(props)
      const input = component.find(CheckboxInput).at(0).getElement().props

      expect(component.find(DateInput).length).toBe(1)
      expect(input.value).toBe(true)
    })

    it('is unchecked if has end_date', () => {
      props.end_date = '2018-05-03T23:00:00.000Z'
      const component = getElement(props)
      const input = component.find(CheckboxInput).at(0).getElement().props

      expect(component.find(DateInput).length).toBe(2)
      expect(input.value).toBe(false)
    })

    it('can toggle show end date', () => {
      const component = getElement(props)
      const input = component.find('input[type="checkbox"]').at(0)
      input.simulate('change', { target: { checked: true } })

      expect(component.find(DateInput).length).toBe(2)
    })
  })

  describe('all_day', () => {
    it('is unchecked by default', () => {
      props.end_date = '2018-05-03T23:00:00.000Z'
      const component = getElement(props)
      const input = component.find(CheckboxInput).at(1).getElement().props

      expect(component.find('input[type="time"]').length).toBe(2)
      expect(input.value).toBe(false)
    })

    it('can toggle all_day', () => {
      const component = getElement(props)
      const input = component.find('input[type="checkbox"]').at(1)
      input.simulate('change', { target: { checked: true } })

      expect(props.onChange.mock.calls[0][0]).toBe('all_day')
      expect(props.onChange.mock.calls[0][1]).toBe(true)
    })
  })

  describe('start_date', () => {
    describe('rendering', () => {
      it('renders a start_date input with data', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(0).instance().date

        expect(input.defaultValue).toBe('2018-05-02')
      })

      xit('renders a start_time input with data', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(0).instance().time

        expect(input.defaultValue).toBe('19:00')
      })
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

      xit('can change start_time', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(0).instance()
        input.time.value = '12:00'
        input.onKeyUp()
        // TODO: sensitive to server local time
        const onChange = props.onChange.mock.calls[0]
        expect(onChange[0]).toBe('start_date')
      })
    })
  })

  describe('end_date', () => {
    beforeEach(() => {
      props.end_date = '2018-05-03T23:00:00.000Z'
    })

    describe('rendering', () => {
      it('renders a date input with data', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(1).instance().date

        expect(input.type).toBe('date')
        expect(input.defaultValue).toBe('2018-05-03')
      })

      xit('renders a time input with data', () => {
        const component = getElement(props)
        const input = component.find('input').at(1).getElement().props

        expect(input.type).toBe('time')
        expect(input.defaultValue).toBe('19:00')
      })
    })

    describe('editing', () => {
      it('can change end_date', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(1).instance()
        input.date.value = '2018-05-04'
        input.onKeyUp()

        const onChange = props.onChange.mock.calls[0]
        expect(onChange[0]).toBe('end_date')
        expect(onChange[1]).toMatch('2018-05-04')
      })

      xit('can change end_date', () => {
        const component = getElement(props)
        const input = component.find(DateInput).at(1).instance()
        input.time.value = '12:00'
        input.onKeyUp()
        // TODO: sensitive to server local time
        const onChange = props.onChange.mock.calls[0]
        expect(onChange[0]).toBe('end_date')
        expect(onChange[1]).toMatch('16:00')
      })
    })
  })
})
