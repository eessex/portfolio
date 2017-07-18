import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import EventTeaserRow from '../../event/components/show/teaser_row.js'
import EditTeaserRow from '../../event/components/edit/teaser_row.js'

class EventsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: null
    }
  }

  getComponent(event) {
    if (this.props.isAuthenticated) {
      return <EditTeaserRow event={event} />
    } else {
      return <EventTeaserRow event={event} />
    }
  }

  sortByDate(events) {
    let upcomingEvents = []
    let pastEvents = []
    for (event of events) {
      if (new Date() < new Date(event.start_date)) {
        upcomingEvents.push(event)
      } else {
        pastEvents.push(event)
      }
    }
    return {
      upcomingEvents,
      pastEvents
    }
  }

  renderList(events) {
    const listItems =  events.map( (event, i) =>
      <div className='events-list__item' key={i}>
        <Link to={"/events/" + event._id}>
          {this.getComponent(event)}
        </Link>
      </div>
    );
    return listItems
  }

  renderUpcomingLabel(events) {
    if (events.length) {
      return <div className='events-list__header'>Upcoming Events</div>
    }
  }

  render() {
    const { events } = this.props
    const upcomingEvents = this.sortByDate(events).upcomingEvents
    const pastEvents = this.sortByDate(events).pastEvents
    return (
      <div className='events-list'>
        <nav>
          <Link to="/events/new"><button>New Event</button></Link>
        </nav>
        <div className='events-list--upcoming'>
          {this.renderUpcomingLabel(upcomingEvents)}
          <div className='events-list__list'>
            {this.renderList(upcomingEvents)}
          </div>
        </div>
        <div className='events-list--past'>
          <div className='events-list__header'>Past Events</div>
          <div className='events-list__list'>
            {this.renderList(pastEvents)}
          </div>
        </div>
      </div>
    );
  }
}

export default EventsList;
