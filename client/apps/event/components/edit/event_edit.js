import React, { Component } from 'react';

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.firstSaveEvent = this.firstSaveEvent.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      event: this.props.event
    };
  }

  onChange(e) {
    event = this.state.event
    event[e.target.name] = e.target.value
    this.setState(event)
  }

  firstSaveEvent() {
    console.log('clicked save')
    this.props.actions.createEvent(this.state.event)
    window.location.replace('/events/' + this.state.event._id)
  }

  saveEvent() {
    debugger
  }

  render() {
    const { isNew } = this.props;
    const { event } = this.state;
    var saveButton = isNew ? this.firstSaveEvent : this.saveEvent
    return (
      <div className='event--edit'>
        <div className='event--edit__header'>New Event</div>
        <input
          name='title'
          required
          defaultValue={event.title}
          onChange={this.onChange}
          placeholder='Title' />
        <button onClick={saveButton}>Save</button>
      </div>
    );
  }
}

export default EventEdit;