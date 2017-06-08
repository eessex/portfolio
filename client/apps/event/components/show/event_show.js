import React, { Component } from 'react';

class EventShow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event--show'>
        <div className='event--show__header'>{event.title}</div>
      </div>
    );
  }
}

export default EventShow;