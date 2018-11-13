import { clone } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { formats } from 'client/tests/fixtures/components'
import { FormatEdit } from '../format_edit'
import { Checkbox } from 'client/components/FormInputs/Checkbox'
import { Select } from 'client/components/FormInputs/Select'
import { Input } from 'client/styles/forms'

describe('Format', () => {
  const getElement = props => {
    return mount(
      <FormatEdit {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      item: clone(formats[0]),
      onChange: jest.fn()
    }
  })

  it('Renders a save button if existing data', () => {
    const component = getElement(props)
    expect(component.find('button')).toHaveLength(1)
  })

  it('Can save changed data', () => {
    props.index = 1
    const component = getElement(props)
    const input = component.find(Select).getElement()

    input.props.onChange('format', 'CD')
    component.find('button').simulate('click')
    expect(props.onChange.mock.calls[0][0].format).toBe('CD')
    expect(props.onChange.mock.calls[0][1]).toBe(1)
  })

  describe('Formats select', () => {
    beforeEach(() => {
      props = {
        item: formats[0],
        onChange: jest.fn()
      }
    })

    it('Renders field', () => {
      props.item = {}
      const component = getElement(props)
      const input = component.find(Select).getElement()

      expect(input.props.options).toEqual(
        [ 'LP', '2xLP', 'Cassette', '2xCassette', 'CD', '2xCD', 'Digital' ]
      )
    })

    it('Renders saved data', () => {
      const component = getElement(props)
      const input = component.find(Select).getElement()

      expect(input.props.value).toBe('Cassette')
    })

    it('Can change data', () => {
      const component = getElement(props)
      const input = component.find(Select).getElement()
      input.props.onChange('format', 'CD')

      expect(component.state().item.format).toBe('CD')
      expect(component.state().needsSave).toBe(true)
    })
  })

  describe('Release year', () => {
    it('Renders field', () => {
      props.item = {}
      const component = getElement(props)
      const input = component.find(Input).at(0).getElement()

      expect(input.props.placeholder).toBe('YYYY')
    })

    it('Renders saved data', () => {
      const component = getElement(props)
      const input = component.find(Input).at(0).getElement()

      expect(input.props.defaultValue).toBe(2018)
    })

    it('Can change data', () => {
      const component = getElement(props)
      const input = component.find(Input).at(0)
      input.simulate('change', {target: {value: '2020'}})

      expect(component.state().item.release_year).toBe(2020)
      expect(component.state().needsSave).toBe(true)
    })
  })

  describe('Publisher', () => {
    it('Renders field', () => {
      props.item = {}
      const component = getElement(props)
      const input = component.find(Input).at(1).getElement()

      expect(input.props.placeholder).toBe('publisher')
    })

    it('Renders saved data', () => {
      const component = getElement(props)
      const input = component.find(Input).at(1).getElement()

      expect(input.props.defaultValue).toBe('Soap Library')
    })

    it('Can change data', () => {
      const component = getElement(props)
      const input = component.find(Input).at(1)
      input.simulate('change', {target: {value: 'Sky Walking'}})

      expect(component.state().item.publisher).toBe('Sky Walking')
      expect(component.state().needsSave).toBe(true)
    })
  })

  describe('Compilation checkbox', () => {
    it('Renders field', () => {
      const component = getElement(props)
      const input = component.find(Checkbox).at(0)

      expect(input.getElement().props.label).toBe('Compilation')
      expect(input.getElement().props.value).toBeFalsy()
    })

    it('Renders saved data', () => {
      props.item.compilation = true
      const component = getElement(props)
      const input = component.find(Checkbox).at(0)

      expect(input.getElement().props.value).toBe(true)
    })

    it('Can change data', () => {
      props.item.compilation = false
      const component = getElement(props)
      const input = component.find(Checkbox).at(0).getElement()
      input.props.onChange('compilation', true)

      expect(component.state().item.compilation).toBe(true)
      expect(component.state().needsSave).toBe(true)
    })
  })

  describe('Featured artist checkbox', () => {
    it('Renders field', () => {
      const component = getElement(props)
      const input = component.find(Checkbox).at(1)

      expect(input.getElement().props.label).toBe('Featuring')
      expect(input.getElement().props.value).toBeFalsy()
    })

    it('Renders saved data', () => {
      props.item.featuring = true
      const component = getElement(props)
      const input = component.find(Checkbox).at(1)

      expect(input.getElement().props.value).toBe(true)
    })

    it('Can change data', () => {
      props.item.featuring = false
      const component = getElement(props)
      const input = component.find(Checkbox).at(1).getElement()
      input.props.onChange('featuring', true)

      expect(component.state().item.featuring).toBe(true)
      expect(component.state().needsSave).toBe(true)
    })
  })
})
