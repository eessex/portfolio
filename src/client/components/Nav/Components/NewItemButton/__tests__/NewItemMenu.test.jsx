import React from 'react'
import { mount } from 'enzyme'

import { Button } from 'client/components/Button'
import { NewItemMenu } from '../NewItemMenu'

describe('NewItemMenu', () => {
  let props

  beforeEach(() => {
    props = {
      createItemAction: jest.fn(),
      onClose: jest.fn()
    }
  })

  const getWrapper = (passedProps = props) => {
    return mount(
      <NewItemMenu {...passedProps} />
    )
  }

  it('Renders item links', () => {
    const component = getWrapper()

    expect(component.find('a').length).toBe(3)
    expect(component.text()).toMatch('Event')
    expect(component.text()).toMatch('Project')
    expect(component.text()).toMatch('Release')
  })

  it('Calls #createItemAction on button click', () => {
    const component = getWrapper()
    component.find('a').first().simulate('click')

    expect(props.createItemAction).toBeCalledWith('events')
  })

  it('Calls props.onClose on button click', () => {
    const component = getWrapper()
    component.find(Button).simulate('click')

    expect(props.onClose).toBeCalled()
  })
})
