import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import EventTeaser from '../../event/components/event_teaser.js'

class EventsList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listItems = this.props.events.map( (event, i) =>
      <div className='events-list__item' key={i}>
        <Link to={"/events/" + event._id}>
          <EventTeaser event={event} admin={true}/>
        </Link>
      </div>
    );

    return (
      <div className='events-list'>
        <div className='events-list__header'>Events List</div>
        <div className='events-list__list'>{listItems}</div>
      </div>
    );
  }
}

export default EventsList;
