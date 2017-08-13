import React, { Component } from 'react';
const moment = require('moment');

class EventShow extends Component {
  constructor(props) {
    super(props);
  }
  renderVenue(event) {
    var venue = ''
    var address = ''
    if (event.venue) {
      if (event.venue.name.length) {
        venue = 'at ' + event.venue.name
      }
      if (event.venue.address.length) {
        address = ': ' + event.venue.address
      }
    }
    return venue + address
  }
  render() {
    const { event } = this.props;
    return (
      <div className='event--show' style={{paddingLeft: 20, paddingRight: 20, marginTop: '1em'}}>
        <div className='event--show__header container'>
          <h1 style={{margin: 0}}>{event.title}</h1>
          <h4 className='event--show__date'>
            {moment(event.start_date).format('MMM DD, YYYY - h:mma')}
          </h4>
          <p>{this.renderVenue(event)}</p>
        </div>
        <div
          className='event--show__description container'
          dangerouslySetInnerHTML={{__html: event.description}} />
      </div>
    );
  }
}

export default EventShow;