import React, { Component } from 'react';
const moment = require('moment');

class EventShow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event--show' style={{paddingLeft: 20, paddingRight: 20}}>
        <div className='event--show__header'>
          <h1 style={{margin: 0}}>{event.title}</h1>
          <h4 className='event--show__date'>
            {moment(event.start_date).format('MMM DD, YYYY - h:mma')}
          </h4>
        </div>
        <div
          className='event--show__description'
          dangerouslySetInnerHTML={{__html: event.description}} />
      </div>
    );
  }
}

export default EventShow;