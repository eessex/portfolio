import { mount } from 'enzyme'
import React from 'react'
import { ItemGrid } from '../components/item_grid.jsx'

describe('ItemGrid', () => {
  let props = {}
  
  beforeEach(() => {
    props = {
      date: 'Dec 6, 2017',
      description: '<p>Here is a description.</p>',
      image: {url: 'http://image.jpg'},
      title: 'Cool show',
      venue: 'The Sump, Ridgewood'
    }
  })

  it('renders expected data', () => {
    const component = mount(
      <ItemGrid {...props} />
    )
    expect(component.html()).toMatch(props.image.url)
    expect(component.text()).toMatch(props.title)
    expect(component.text()).toMatch(props.date)
    expect(component.text()).toMatch(props.venue)
    expect(component.text()).toMatch(
      props.description
        .replace('<p>', '')
        .replace('</p>', '')
    )
  })
})
