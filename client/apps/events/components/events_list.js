import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class EventsList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listItems = this.props.events.map( (event, i) =>
      <li className='events-list__item' key={i}>
        <Link to={"/events/" + event._id}>{event.title}</Link>
      </li>
    );

    return (
      <div className='events-list'>
        <div className='events-list__header'>Events List</div>
        <ul className='events-list__list'>{listItems}</ul>
      </div>
    );
  }
}

export default EventsList;