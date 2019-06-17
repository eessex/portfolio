import { mount } from 'enzyme'
import React from 'react'
import { ItemTable } from '../components/item_table'

describe('ItemTable', () => {
  let props
  
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
      <ItemTable {...props} />
    )

    expect(component.text()).toMatch(props.title)
    expect(component.text()).toMatch(props.date)
    expect(component.text()).toMatch(props.venue)
    expect(component.html()).not.toMatch(props.image.url)
    expect(component.text()).not.toMatch(
      props.description
        .replace('<p>', '')
        .replace('</p>', '')
    )
  })
})
