import React, { Component } from 'react'
import EventDate from '../show/components/date.jsx'
import EventImage from './components/image.jsx'
import EventVenue from '../show/components/venue.jsx'

export default class EventShow extends Component {
  constructor(props) {
    super(props)
  }

  renderLinks(event) {
    if (event.links) {
      const listItems =  event.links.map( (link, i) =>
      <div className='event--show__link' key={i}>
        <a href={link.url} target='_blank'>
          {link.title ? link.title : link.url}
        </a>
      </div>
    )
    return <div className='event--show__links'>{listItems}</div>
    }
  }

  render() {
    const { event } = this.props
    return (
      <div className='event--show'>
        {event.images && event.images[0] ?
          <div className='event__image'><EventImage image={event.images[0]} /></div> : null
        }
        <div className='event__body container'>
          <div className='event__header'>
            <h1>{event.title}</h1>
            <EventDate event={event} />
            <EventVenue venue={event.venue} />
          </div>
          <div
            className='event__description'
            dangerouslySetInnerHTML={{__html: event.description}} />
          {this.renderLinks(event)}
        </div>
      </div>
    )
  }
}
