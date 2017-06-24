import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import EventTeaserRow from '../../event/components/show/teaser_row.js'
import EditTeaserRow from '../../event/components/edit/teaser_row.js'

class EventsList extends Component {
  constructor(props) {
    super(props);
  }

  getComponent(event) {
    if (this.props.isAuthenticated) {
      return <EditTeaserRow event={event} />
    } else {
      return <EventTeaserRow event={event} />
    }
  }

  render() {
    const listItems = this.props.events.map( (event, i) =>
      <div className='events-list__item' key={i}>
        <Link to={"/events/" + event._id}>
          {this.getComponent(event)}
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
