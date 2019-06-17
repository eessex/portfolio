import { mount } from 'enzyme'
import React from 'react'
import { ListItem } from '../components/list_item'
import { ItemGrid } from '../components/item_grid'
import { ItemTable } from '../components/item_table'

jest.mock('react-router-dom')

describe('ListItem', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <ListItem {...passedProps} />
    )
  }

  beforeEach(() => {
    props = {
      date: 'Dec 6, 2017',
      description: '<p>Here is a description.</p>',
      image: {url: 'http://image.jpg'},
      title: 'Cool show',
      venue: 'The Sump, Ridgewood',
      slug: 'cool-show'
    }
  })

  it('can render the grid layout', () => {
    props.layout = 'grid'
    const component = getWrapper()
    expect(component.find(ItemGrid).length).toBe(1)
  })

  it('can render the table layout', () => {
    props.layout = 'table'
    const component = getWrapper()
    expect(component.find(ItemTable).length).toBe(1)
  })
})
