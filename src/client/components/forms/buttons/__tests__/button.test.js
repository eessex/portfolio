import { mount } from 'enzyme'
import React from 'react'
import { Button } from '../button.jsx'
import { FileInput } from '../../file_input/index.jsx'

describe('Button', () => {
  const child = <FileInput onChange={jest.fn()} fetchUpload={jest.fn()} />
  let props = {}

  beforeEach(() => {
    props = {
      onClick: jest.fn(),
      text: 'New project'
    }
  })

  it('renders a button', () => {
    const component = mount(
      <Button {...props} />
    )
    expect(component.find('button').length).toBe(1)
    expect(component.text()).toMatch(props.text)
  })

  it('renders an icon if props.icon', () => {
    props.icon = 'times'
    const component = mount(
      <Button {...props} />
    )
    expect(component.html()).toMatch('fa-times')
  })

  it('renders a child', () => {
    const component = mount(
      <Button {...props}>{child}</Button>
    )
    expect(component.find(FileInput).length).toBe(1)
  })

  it('Calls props.onClick when clicked', () => {
    const component = mount(
      <Button {...props} />
    )
    const button = component.find('button')
    button.simulate('click')
    expect(props.onClick.mock.calls.length).toBe(1)
  })
})
