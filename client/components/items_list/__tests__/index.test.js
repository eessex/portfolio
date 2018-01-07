import moment from 'moment'
import { mount } from 'enzyme'
import React from 'react'
import { ItemsList } from '../index.jsx'
import { ListItem } from '../components/list_item.jsx'
import { getDate, getVenue } from '../../../utils/index.js'
import {
  UpcomingEvent,
  PastEvent,
  tomorrow
} from '../../../tests/fixtures/events.js'

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
    expect(component.html()).toMatch('ItemsList--events list')
  })

  it('Renders layout based on props', () => {
    props.layout = 'grid'
    const component = mount(
      <ItemsList {...props} />
    )
    expect(component.find(ListItem).length).toBe(2)
    expect(component.html()).toMatch('ItemsList--events grid')
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
