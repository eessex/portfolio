import React from 'react'
import { render } from 'enzyme'
import { Header } from '../../../apps/components/header'
import { Route, Link, MemoryRouter } from 'react-router-dom'

function setup(isAuthenticated=false) {
  const enzymeWrapper = render(<Header isAuthenticated={isAuthenticated} />)
  return {
    enzymeWrapper
  }
}

describe('Header', () => {
  it('should render self and menu icon', () => {
    var { enzymeWrapper } = setup()
    var children = enzymeWrapper.find('.header').children().nodes

    expect(enzymeWrapper.find('.header').children().length).toBe(2)

    expect(children[0].type).toBe('h2')
    expect(children[0].props.children.props.to).toBe('/')
    expect(children[0].props.children.props.children).toBe('Home')
    expect(children[0].props.children.props.replace).toBe(false)

    expect(children[1].props.children[0].props.open).toBe(false)
  })

  it('should render the anon menu links', () => {
    var { enzymeWrapper } = setup(true)
    var children = enzymeWrapper.find('.header').children().nodes

    console.log(enzymeWrapper)
  //   expect(enzymeWrapper.find('.header').children().length).toBe(2)

  //   expect(children[0].type).toBe('h2')
  //   expect(children[0].props.children.props.to).toBe('/')
  //   expect(children[0].props.children.props.children).toBe('Home')
  //   expect(children[0].props.children.props.replace).toBe(false)

  //   expect(children[1].props.children[0].props.open).toBe(false)
  })
});
