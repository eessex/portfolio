import React, { Component } from 'react';
const moment = require('moment');

export default class EditTeaserRow extends Component {
  constructor(props) {
    super(props);
  }

  renderPublished(event) {
    if (!event.published) {
      return 'draft'
    } else {
      return 'published'
    }
  }
  renderVenue(event) {
    debugger
    if (event.venue) {
      if (event.venue.name.length) {
        return event.venue.name
      }
    }
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event-teaser'>
        <div className='event-teaser__header' style={styles.header}>
          <h4 style={styles.date}>{moment(event.start_date).format('MMM DD, YYYY - h:mma')}</h4>
          <h4 style={styles.title}>{event.title || 'Missing title'}</h4>
          <h4>{this.renderVenue(event)}</h4>
          <h4 style={styles.date}>{this.renderPublished(event)}</h4>
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
    flex: 4
  }
}