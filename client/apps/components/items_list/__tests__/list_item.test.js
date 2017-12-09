import { mount } from 'enzyme'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ListItem } from '../components/list_item.jsx'
import { ItemGrid } from '../components/item_grid.jsx'
import { ItemTable } from '../components/item_table.jsx'

jest.mock('react-router-dom')

describe('ListItem', () => {
  let props = {}
  let layout
  
  beforeEach(() => {
    props = {
      date: 'Dec 6, 2017',
      description: '<p>Here is a description.</p>',
      image: {url: 'http://image.jpg'},
      title: 'Cool show',
      venue: 'The Sump, Ridgewood',
      slug: 'cool-show',
      layout
    }
  })

  it('can render the grid layout', () => {
    props.layout = 'grid'
    const component = mount(
      <ListItem {...props} />
    )
    expect(component.find(ItemGrid).length).toBe(1)
  })

  it('can render the table layout', () => {
    props.layout = 'table'
    const component = mount(
      <ListItem {...props} />
    )
    expect(component.find(ItemTable).length).toBe(1)
  })
})
