import React, { Component } from 'react'
const moment = require('moment')

export default class EventTeaserGrid extends Component {
  constructor(props) {
    super(props)
  }

  renderVenue(event) {
    let venue
    const city = event.venue.city.length ? ', ' + event.venue.city : ''
    if (event.venue && event.venue.name.length) {
      venue = '@ ' + event.venue.name + city
    } else if (event.venue && event.venue.address.length) {
      venue = '@ ' + event.venue.address + city
    }
    return venue
  }

  renderImage(event) {
    if(event.images.length) {
      return <img src={event.images[0].url} width='100%' />
    }
  }

  renderTitle(event) {
    if(event.images.length) {
      return <h4>{event.title || 'Untitled'}</h4>
    } else {
      return <h2>{event.title || 'Untitled'}</h2>
    }
  }

  render() {
    const { event } = this.props
    return (
      <div className='event-teaser--grid'>
        {this.renderImage(event)}
        <div className='event-teaser__header'>
          {this.renderTitle(event)}
          <h4>{moment(event.start_date).format('MMM DD, YYYY - h:mma')}</h4>
          <h4>{this.renderVenue(event)}</h4>
        </div>
      </div>
    )
  }
}
