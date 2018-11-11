import React from 'react'
import configureStore from 'redux-mock-store'
import { mount } from 'enzyme'
import { MemoryRouter as Router, NavLink } from 'react-router-dom'
import { Provider } from 'react-redux'

import Nav from '../Nav'
import { AdminNav } from '../Components/AdminNav'

describe('Nav', () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      userReducer: {
        isAuthenticated: props.isAuthenticated || false
      }
    })

    return mount(
      <Provider store={store}>
        <Router>
          <Nav {...passedProps} />
        </Router>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      location: { pathname: '/events' },
      isAuthenticated: false
    }
  })

  it('Renders the home link', () => {
    const component = getWrapper(props)
    const link = component.find('a').first().props()

    expect(link.href).toBe('/')
    expect(link.children).toMatch('Portfolio')
  })

  it('Renders the nav items', () => {
    const component = getWrapper(props)
    const links = component.find(NavLink)
    expect(links.length).toBe(4)

    expect(links.at(0).props().to).toMatch('/events')
    expect(links.at(0).props().children).toMatch('Events')

    expect(links.at(1).props().to).toMatch('/releases')
    expect(links.at(1).props().children).toMatch('Releases')

    expect(links.at(2).props().to).toMatch('/projects')
    expect(links.at(2).props().children).toMatch('Projects')

    expect(links.at(3).props().to).toMatch('/info')
    expect(links.at(3).props().children).toMatch('Info')
  })

  it('Shows AdminNav if authenticated', () => {
    props.isAuthenticated = true
    const component = getWrapper(props)

    expect(component.find(AdminNav).exists()).toBeTruthy()
  })

  xit('#onScroll sets the layout position to "up" when scrolling up', () => {
    window.pageYOffset = 700
    const component = getWrapper(props)
    component.setState({scrollPosition: 800})

    component.instance().onScroll()
    expect(component.state().scrollPosition).toBe(700)
    expect(component.state().scrollDir).toBe('up')
  })

  xit('#onScroll sets the layout position to null when scrolling down', () => {
    window.pageYOffset = 900
    const component = getWrapper(props)
    component.setState({scrollPosition: 800})

    component.instance().onScroll()
    expect(component.state().scrollPosition).toBe(900)
    expect(component.state().scrollDir).toBe(null)
  })
})
