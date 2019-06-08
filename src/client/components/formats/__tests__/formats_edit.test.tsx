import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { formats } from 'client/tests/fixtures/components'
import { FormatEdit } from 'client/components/format/format_edit'
import { FormatsEdit } from '../formats_edit'

describe('FormatsEdit', () => {
  let props
  const getElement = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <FormatsEdit {...passedProps} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    props = {
      formats,
      onChange: jest.fn()
    }
  })

  it('Renders empty input by default', () => {
    props.formats = []
    const component = getElement(props)

    expect(component.find(FormatEdit)).toHaveLength(1)
    expect(component.find(FormatsEdit).text()).not.toMatch('Add New')
  })

  it('If has formats, renders existing format inputs and new button', () => {
    const component = getElement(props)

    expect(component.find(FormatEdit)).toHaveLength(2)
    expect(component.find('button').at(4).text()).toBe('Add New')
  })

  it('Renders existing data in forms', () => {
    const component = getElement(props)
    const inputs = component.find('input')

    expect(inputs.at(0).props().defaultValue).toBe(2018)
    expect(inputs.at(1).props().defaultValue).toBe('Soap Library')
    expect(inputs.at(2).props().defaultChecked).toBe(false)
    expect(inputs.at(3).props().defaultChecked).toBe(false)
  })

  it('#onNewFormat adds a new format', () => {
    props.formats = []
    const format = formats[0]
    const component = getElement(props)
    component.find(FormatsEdit).instance().onNewFormat(format)

    expect(props.onChange.mock.calls[0][0]).toBe('formats')
    expect(props.onChange.mock.calls[0][1]).toEqual([format])
    expect(component.find(FormatsEdit).instance().state.showNewForm).toBeFalsy()
  })

  it('#onChangeFormat can change an existing format', () => {
    const format = formats[0]
    format.release_year = 2020
    const component = getElement(props)
    component.find(FormatsEdit).instance().onChangeFormat(format, 0)

    expect(props.onChange.mock.calls[0][0]).toBe('formats')
    expect(props.onChange.mock.calls[0][1][0].release_year).toEqual(2020)
  })
})
