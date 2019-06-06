import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Input, ErrorContainer } from 'client/styles/forms'
import { Loading } from 'client/components/Loading'
import { Login } from '../login'

describe('Login', () => {
  const getWrapper = props => {
    return mount(
      <ThemeProvider theme={theme}>
        <Login {...props} />
      </ThemeProvider>
    )
  }
  let props

  beforeEach(() => {
    props = {
      error: null,
      loading: false,
      loginUserAction: jest.fn(),
      isAuthenticated: false
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
  })

  it('Calls #loginUserAction on submit', () => {
    let email = 'email@email.com'
    let password = 'password'
    const component = getWrapper(props)
    component.find(Login).instance().email.value = email
    component.find(Login).instance().password.value = password
    component.find('button').simulate('click')

    expect(props.loginUserAction.mock.calls[0][0].email).toBe(email)
    expect(props.loginUserAction.mock.calls[0][0].password).toBe(password)
  })

  it('Renders errors if present', () => {
    props.error = 'Password did not match'
    const component = getWrapper(props)

    expect(component.text()).toMatch('Password did not match')
    expect(component.find(ErrorContainer)).toHaveLength(1)
  })
})
