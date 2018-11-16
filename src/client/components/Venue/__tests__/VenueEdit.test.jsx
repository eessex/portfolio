import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Input } from 'client/styles/forms'
import { Select } from 'client/components/FormInputs/Select'
import { Venue as VenueFixture } from 'client/tests/fixtures/components'
import { VenueEdit } from '../VenueEdit'

describe('VenueEdit', () => {
  let props
  const getWrapper = passedProps => {
    return mount(
      <ThemeProvider theme={theme}>
        <VenueEdit {...passedProps} />
      </ThemeProvider>
    )
  }

  describe('Rendering', () => {
    beforeEach(() => {
      props = {
        venue: cloneDeep(VenueFixture),
        onChange: jest.fn()
      }
    })

    it('Can render saved name', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(0)

      expect(input.props().placeholder).toBe('Venue Name')
      expect(input.props().value).toBe('National Arts Club')
    })

    it('Can render saved address', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(1)

      expect(input.props().placeholder).toBe('Address')
      expect(input.props().value).toBe('15 Gramercy Park S.')
    })

    it('Can render saved city', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(2)

      expect(input.props().placeholder).toBe('City')
      expect(input.props().value).toBe('New York')
    })

    it('Can render saved state', () => {
      const component = getWrapper(props)
      const input = component.find(Select)

      expect(input.props().value).toBe('NY')
    })

    it('Can render saved country', () => {
      const component = getWrapper(props)
      const input = component.find(Input).last()

      expect(input.props().placeholder).toBe('Country')
      expect(input.props().value).toBe('USA')
    })
  })

  describe('Editing', () => {
    beforeEach(() => {
      props = {
        venue: {},
        onChange: jest.fn()
      }
    })

    it('Can edit name', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(0)
      input.simulate('change', { target: { value: 'Cool venue' } })

      expect(props.onChange).toBeCalledWith({
        name: 'Cool venue',
        address: null,
        city: null,
        state: null,
        country: null
      })
    })

    it('Can edit address', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(1)
      input.simulate('change', { target: { value: '123 Avenue A' } })

      expect(props.onChange).toBeCalledWith({
        name: null,
        address: '123 Avenue A',
        city: null,
        state: null,
        country: null
      })
    })

    it('Can edit city', () => {
      const component = getWrapper(props)
      const input = component.find(Input).at(2)
      input.simulate('change', { target: { value: 'Berlin' } })

      expect(props.onChange).toBeCalledWith({
        name: null,
        address: null,
        city: 'Berlin',
        state: null,
        country: null
      })
    })

    it('Can edit state', () => {
      const component = getWrapper(props)
      const input = component.find('select')
      input.simulate('change', { target: { value: 'OH' } })

      expect(props.onChange).toBeCalledWith({
        name: null,
        address: null,
        city: null,
        state: 'OH',
        country: null
      })
    })

    it('Can edit country', () => {
      const component = getWrapper(props)
      const input = component.find(Input).last()
      input.simulate('change', { target: { value: 'Germany' } })

      expect(props.onChange).toBeCalledWith({
        name: null,
        address: null,
        city: null,
        state: null,
        country: 'Germany'
      })
    })
  })
})
