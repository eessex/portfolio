import { mount } from 'enzyme'
import React from 'react'
import { formats } from 'client/tests/fixtures/components'
import { Format, FormatContainer } from '../format'

describe('Format', () => {
  const getElement = props => {
    return mount(
      <Format {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      item: formats[0]
    }
  })

  it('Renders expected data by default', () => {
    const component = getElement(props)
    expect(component.text()).toBe('Cassette, Soap Library, 2018')
  })

  it('Renders expected data in short format', () => {
    props.short = true
    const component = getElement(props)
    expect(component.text()).toBe('Cassette, Soap Library')
  })

  it('Renders with missing data', () => {
    delete props.item.publisher
    const component = getElement(props)
    expect(component.text()).toBe('Cassette, 2018')
  })

  it('Responds to onClick if provided', () => {
    props.onClick = jest.fn()
    const component = getElement(props)
    component.find(FormatContainer).simulate('click')

    expect(props.onClick).toBeCalled()
  })
})
