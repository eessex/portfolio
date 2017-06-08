import React, { Component } from 'react';

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.saveEvent = this.saveEvent.bind(this);

    this.state = {
      event: this.props.event
    };
  }

  firstSaveEvent() {
    console.log('clicked save')
    this.props.actions.updateEvent(this.state.event)
    // this.props.history.push('/events/' + this.state.event._id)
  }

  render() {
    const { event, isNew } = this.props;
    return (
      <div className='event--edit'>
        <div className='event--edit__header'>New Event</div>
        <input
          name='title'
          required
          defaultValue={event.title}
          placeholder='hi Event Title' />
        <button onClick={this.firstSaveEvent}>Save</button>
      </div>
    );
  }
}

export default EventEdit;