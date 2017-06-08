import React, { Component } from 'react';
import EventEdit from './edit/event_edit.js'
import EventShow from './show/event_show.js'

class EventContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { event, isNew } = this.props;
    if (isNew) {
      return (
        <EventEdit event={event} isNew={isNew} actions={this.props.actions} />
      );
    } else {
      return (
        <EventShow event={event}/>
      );
    }
  }
}

export default EventContainer;