import React from 'react'
import { shallow } from 'enzyme'
import Header from '../../../apps/components/header'
import { MemoryRouter } from 'react-router'

const props = {
  store: {
    getState: () => {},
    subscribe: () => {},
    dispatch: () => {}
  }
}

function setup() {
  const enzymeWrapper = shallow(<MemoryRouter><Header {...props}/></MemoryRouter>)
  return {
    enzymeWrapper
  }
}

describe('Header', () => {
  it('should render self and menu links', () => {
    const { enzymeWrapper } = setup()
    var children = enzymeWrapper.find('.header').children().nodes

    console.log(enzymeWrapper.children().nodes)

    // expect(enzymeWrapper.find('.header').children().length).toBe(2)

//     expect(children[0].props.to).toBe('/')
//     expect(children[0].props.children).toBe('Home')
//     expect(children[0].props.replace).toBe(false)

//     expect(children[1].props.to).toBe('/events')
//     expect(children[1].props.children).toBe('Events')
//     expect(children[1].props.replace).toBe(false)

//     expect(children[2].props.to).toBe('/events/new')
//     expect(children[2].props.children).toBe('New')
//     expect(children[2].props.replace).toBe(false)

//     expect(children[3].props.to).toBe('/pages')
//     expect(children[3].props.children).toBe('Pages')
//     expect(children[3].props.replace).toBe(false)

  })
});
