import React, { Component } from 'react';

class EventTeaser extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event-teaser'>
        <div className='event-teaser__header'>{event.title}</div>
      </div>
    );
  }
}

export default EventTeaser;