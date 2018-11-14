import { mount } from 'enzyme'
import React from 'react'
import { formats } from 'client/tests/fixtures/components'
import { Formats, FormatsContainer } from '../formats'

describe('Formats', () => {
  const getElement = props => {
    return mount(
      <Formats {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      short: false,
      formats
    }
  })

  it('Renders a list of formats', () => {
    const component = getElement(props)

    expect(component.html()).toMatch('Cassette, Soap Library, 2018')
    expect(component.html()).toMatch('LP, Sky Walking, 2018')
  })

  it('Renders short formats', () => {
    props.short = true
    const component = getElement(props)

    expect(component.html()).toMatch('Cassette, Soap Library')
    expect(component.html()).toMatch('LP, Sky Walking')
    expect(component.html()).not.toMatch('2018')
  })

  it('Calls onClick if provided', () => {
    props.onClick = jest.fn()
    const component = getElement(props)

    component.find(FormatsContainer).simulate('click')
    expect(props.onClick).toHaveBeenCalled()
  })
})
