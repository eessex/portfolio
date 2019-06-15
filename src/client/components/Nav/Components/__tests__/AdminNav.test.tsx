import React from 'react'
import { mount } from 'enzyme'
import { AdminNav } from '../AdminNav'
import { NewItemButton } from 'client/components/Nav/Components/NewItemButton/NewItemButton'

describe('AdminNav', () => {
  let props
  beforeEach(() => {
    props = {
      logoutUserAction: jest.fn()
    }
  })

  const getWrapper = (passedProps = props) => {
    return mount(
      <AdminNav {...passedProps} />
    )
  }

  it('Renders NewItemButton', () => {
    const component = getWrapper()
    expect(component.find(NewItemButton).exists()).toBeTruthy()
  })

  it('Renders Logout link', () => {
    const component = getWrapper()
    expect(component.find('a').text()).toBe('Logout')
  })

  it('Logout link calls #logoutUserAction on click', () => {
    const component = getWrapper()
    component.find('a').first().simulate('click')
    expect(props.logoutUserAction).toBeCalled()
  })
})
