import React, { Component } from 'react';
const moment = require('moment');

export default class EventTeaserRow extends Component {
  constructor(props) {
    super(props);
  }

  renderVenue(event) {
    var venue = ''
    if (event.venue && event.venue.name.length) {
      venue = '@ ' + event.venue.name
    }
    return venue
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event-teaser'>
        <div className='event-teaser__header' style={styles.header}>
          <h4 style={styles.date}>{moment(event.start_date).format('MMM DD, YYYY - h:mma')}</h4>
          <h4 style={styles.title}>{event.title || 'Missing title'}</h4>
          <h4 style={styles.venue}>{this.renderVenue(event)}</h4>
        </div>
      </div>
    );
  }
}

const styles = {
  header: {
    display: 'flex'
  },
  date: {
    flex: 1
  },
  title: {
    flex: 2
  },
  venue: {
    flex: 1
  }
}