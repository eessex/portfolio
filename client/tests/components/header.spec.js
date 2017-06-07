import React from 'react'
import { shallow } from 'enzyme'
import Header from '../../apps/header'

function setup() {
  const enzymeWrapper = shallow(<Header />)
  return {
    enzymeWrapper
  }
}

describe('Header', () => {
  it('should render self and menu links', () => {
    const { enzymeWrapper } = setup()
    var children = enzymeWrapper.find('.header').children().nodes

    expect(enzymeWrapper.find('.header').children().length).toBe(3)

    expect(children[0].props.to).toBe('/')
    expect(children[0].props.children).toBe('Home')
    expect(children[0].props.replace).toBe(false)

    expect(children[1].props.to).toBe('/events')
    expect(children[1].props.children).toBe('Events')
    expect(children[1].props.replace).toBe(false)

    expect(children[2].props.to).toBe('/pages')
    expect(children[2].props.children).toBe('Pages')
    expect(children[2].props.replace).toBe(false)

  })
});
