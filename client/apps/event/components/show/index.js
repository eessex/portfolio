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
    const { event } = this.props;
    return (
      <div className='event--show'>
        <div className='event--show__header'>
          <h1 style={{margin: 0}}>{event.title}</h1>
          <h4 className='event--show__date'>
            {moment(event.start_date).format('MMM DD, YYYY - h:mma')}
          </h4>
          <p>{this.renderVenue(event)}</p>
        </div>
        <div
          className='event--show__description'
          dangerouslySetInnerHTML={{__html: event.description}} />
        {this.renderLinks(event)}
      </div>
    );
  }
}

export default EventShow;