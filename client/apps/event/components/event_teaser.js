import React, { Component } from 'react';
const moment = require('moment');

class EventTeaser extends Component {
  constructor(props) {
    super(props);
  }

  renderPublished(event) {
    if (this.props.admin) {
      if (!event.published)
      return 'draft'
    } else {
      return 'published'
    }
  }

  render() {
    const { event } = this.props;
    return (
      <div className='event-teaser'>
        <div className='event-teaser__header'>
          <h4>{moment(event.start_date).format('MMM DD, YYYY - h:mma')}</h4>
          <h4>{event.title || 'Missing title'}</h4>
          <h4>{this.renderPublished(event)}</h4>
        </div>
      </div>
    );
  }
}

export default EventTeaser;
