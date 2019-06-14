import { mount } from 'enzyme'
import React from 'react'
import { formats } from 'client/tests/fixtures/components'
import { Format, FormatContainer } from '../format'

describe('Format', () => {
  let props
  const getElement = (passedProps = props) => {
    return mount(
      <Format {...passedProps} />
    )
  }

  beforeEach(() => {
    props = {
      format: formats[0]
    }
  })

  it('Renders expected data by default', () => {
    const component = getElement()
    expect(component.text()).toBe('Cassette, Soap Library, 2018')
  })

  it('Renders expected data in short format', () => {
    props.isShort = true
    const component = getElement()
    expect(component.text()).toBe('Cassette, Soap Library')
  })

  it('Renders with missing data', () => {
    delete props.format.publisher
    const component = getElement()
    expect(component.text()).toBe('Cassette, 2018')
  })

  it('Responds to onClick if provided', () => {
    props.onClick = jest.fn()
    const component = getElement()
    component.find(FormatContainer).simulate('click')

    expect(props.onClick).toBeCalled()
  })
})
