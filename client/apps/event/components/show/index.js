import React, { Component } from 'react';
const moment = require('moment');

class EventShow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event--show'>
        <div className='event--show__header'>
          <h1 style={{margin: 0}}>{event.title}</h1>
        </div>
        <div className='event--show__date'>{moment(event.start_date).format('MMM DD, YYYY - h:mma')}</div>
      </div>
    );
  }
}

export default EventShow;