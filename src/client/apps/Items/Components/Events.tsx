import React, { Component } from 'react'
import { sortByDate } from 'client/utils'
import { ItemsList } from 'client/components/items_list'
import { Item } from 'client/typings'

interface EventsProps {
  items: Item[]
}

export class Events extends Component<EventsProps> {
  render () {
    const { items } = this.props
    const upcoming = sortByDate(items, 'start_date').upcoming.reverse()
    const past = sortByDate(items, 'start_date').past

    return (
      <React.Fragment>
        {upcoming.length > 0 &&
          <ItemsList
            label='Upcoming Events'
            model='events'
            layout='grid'
            list={upcoming}
          />
        }

        {past.length > 0 &&
          <ItemsList
            label='Past Events'
            model='events'
            list={past}
            layout='table'
            canToggle
          />
        }
      </React.Fragment>
    )
  }
}
