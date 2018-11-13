import { mount } from 'enzyme'
import React from 'react'
import { Input, ErrorContainer } from 'client/styles/forms'
import { Loading } from 'client/components/Loading'
import { NewUser } from '../new'

describe('NewUser', () => {
  window.location.replace = jest.fn()

  const getWrapper = props => {
    return mount(
      <NewUser {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      error: null,
      createUserAction: jest.fn(),
      isAuthenticated: true,
      loading: false,
      logoutUserAction: jest.fn()
    }
  })

  it('Shows loading icon if loading', () => {
    props.loading = true
    const component = getWrapper(props)
    expect(component.find(Loading)).toHaveLength(1)
  })

  it('Renders expected inputs', () => {
    const component = getWrapper(props)
    const inputs = component.find(Input)

    expect(inputs.at(0).getElement().props.placeholder).toBe('email')
    expect(inputs.at(0).getElement().props.required).toBe(true)
    expect(inputs.at(1).getElement().props.placeholder).toBe('password')
    expect(inputs.at(1).getElement().props.required).toBe(true)
    expect(inputs.at(2).getElement().props.placeholder).toBe('confirm password')
    expect(inputs.at(2).getElement().props.required).toBe(true)
  })

  it('Calls #createUserAction on submit', () => {
    let email = 'email@email.com'
    let password = 'password'

    const component = getWrapper(props)
    component.instance().email.value = email
    component.instance().password.value = password
    component.instance().password_confirm.value = password
    component.find('button').simulate('click')

    expect(props.createUserAction.mock.calls[0][0].email).toBe(email)
    expect(props.createUserAction.mock.calls[0][0].password).toBe(password)
  })

  it('Renders errors if present', () => {
    props.error = 'Password did not match'
    const component = getWrapper(props)

    expect(component.text()).toMatch('Password did not match')
    expect(component.find(ErrorContainer)).toHaveLength(1)
  })

  it('Forwards to home if not logged in', () => {
    props.isAuthenticated = false
    getWrapper(props)

    expect(window.location.replace.mock.calls[0][0]).toBe('/')
  })
})
