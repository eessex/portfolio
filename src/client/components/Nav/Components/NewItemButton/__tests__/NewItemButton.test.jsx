import React from 'react'
import configureStore from 'redux-mock-store'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'

import { Button } from 'client/components/forms/buttons/button'
import { NewItemButton } from '../NewItemButton'
import NewItemMenu from '../NewItemMenu'

describe('NewItemButton', () => {
  const getWrapper = () => {
    const mockStore = configureStore([])
    const store = mockStore({})

    return mount(
      <Provider store={store}>
        <NewItemButton />
      </Provider>
    )
  }

  it('Renders a button', () => {
    const component = getWrapper()
    expect(component.find(Button).exists()).toBeTruthy()
  })

  it('Sets state.menuIsOpen on button click', () => {
    const component = getWrapper()
    component.find(Button).simulate('click')

    expect(component.find(NewItemButton).instance().state.menuIsOpen).toBeTruthy()
  })

  it('Renders NewItemMenu if state.menuIsOpen', () => {
    const component = getWrapper()
    component.find(Button).simulate('click')

    expect(component.find(NewItemMenu).exists()).toBeTruthy()
  })
})
