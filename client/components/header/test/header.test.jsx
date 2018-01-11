import { mount } from 'enzyme'
import React from 'react'
import { Header } from '../header.jsx'

describe('Header', () => {
  let props = {
    settings: {
      settings: {
        title: 'Cool Website',
        nav: [
          "Events",
          "Releases",
          "Projects",
          "Info"
        ]
      }
    },
    user: {
      isAuthenticated: false,
    }
  }
  window.location = { pathname: '/events' }

  const getWrapper = (props) => {
    return mount(
      <Header {...props} />
    )
  }

  it('Renders the home link', () => {
    const component = getWrapper(props)
    const { title } = props.settings.settings
    const link = component.find('a').first().props()

    expect(link.href).toBe('/')
    expect(link.children).toMatch(title)
  })

  it('Renders the nav items', () => {
    const component = getWrapper(props)
    const { nav } = props.settings.settings
    const links = component.find('.Header__nav a')

    expect(links.at(0).props().href).toMatch(nav[0])
    expect(links.at(0).props().children).toMatch(nav[0])

    expect(links.at(1).props().href).toMatch(nav[1])
    expect(links.at(1).props().children).toMatch(nav[1])

    expect(links.at(2).props().href).toMatch(nav[2])
    expect(links.at(2).props().children).toMatch(nav[2])

    expect(links.at(3).props().href).toMatch(nav[3])
    expect(links.at(3).props().children).toMatch(nav[3])
  })

  it('Sets the layout if admin', () => {
    props.user.isAuthenticated = true
    const component = getWrapper(props)

    expect(component.html()).toMatch('data-layout="admin"')
  })

  it('#onScroll sets the layout position to "up" when scrolling up', () => {
    window.pageYOffset = 700
    const component = getWrapper(props)
    component.setState({scrollPosition: 800})

    component.instance().onScroll()
    expect(component.state().scrollPosition).toBe(700)
    expect(component.state().scrollDir).toBe('up')
  })

  it('#onScroll sets the layout position to null when scrolling down', () => {
    window.pageYOffset = 900
    const component = getWrapper(props)
    component.setState({scrollPosition: 800})

    component.instance().onScroll()
    expect(component.state().scrollPosition).toBe(900)
    expect(component.state().scrollDir).toBe(null)
  })
})
