import { mount } from 'enzyme'
import React from 'react'
import { ItemsList } from '../index.jsx'
import { ListItem } from '../components/list_item'
import { getDate } from 'client/utils'
import { UpcomingEvent, PastEvent } from 'client/tests/fixtures/events'

describe('ItemsList', () => {
  let props = {}

  beforeEach(() => {
    props = {
      list: [
        UpcomingEvent,
        PastEvent
      ],
      model: 'events'
    }
  })

  it('Renders items in "list" layout by default', () => {
    const component = mount(
      <ItemsList {...props} />
    )
    expect(component.find(ListItem).length).toBe(2)
    expect(component.find(ListItem).at(0).props().layout).toBe('list')
  })

  it('Renders a label if provided', () => {
    props.label = 'Upcoming Events'
    const component = mount(
      <ItemsList {...props} />
    )
    expect(component.text()).toMatch(props.label)
  })

  it('Renders layout based on props', () => {
    props.layout = 'grid'
    const component = mount(
      <ItemsList {...props} />
    )
    expect(component.find(ListItem).length).toBe(2)
    expect(component.find(ListItem).at(1).props().layout).toBe('grid')
  })

  it('Renders item title by default', () => {
    const component = mount(
      <ItemsList {...props} />
    )
    expect(component.text()).toMatch(UpcomingEvent.title)
  })

  it('Renders item data for table', () => {
    props.layout = 'table'
    const component = mount(
      <ItemsList {...props} />
    )

    expect(component.text()).toMatch(UpcomingEvent.title)
    expect(component.text()).toMatch(UpcomingEvent.venue.name)
    expect(component.text()).toMatch(UpcomingEvent.venue.city)
    expect(component.text()).toMatch(getDate('events', UpcomingEvent))
  })

  it('Renders item data for grid', () => {
    props.layout = 'table'
    const component = mount(
      <ItemsList {...props} />
    )

    expect(component.text()).toMatch(UpcomingEvent.title)
    expect(component.text()).toMatch(UpcomingEvent.venue.name)
    expect(component.text()).toMatch(UpcomingEvent.venue.city)
    expect(component.text()).toMatch(getDate('events', UpcomingEvent))
  })
})
