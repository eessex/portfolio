import React, { Component } from 'react';
import TextInput from '../../../components/forms/text_input.js';
import EditNav from './nav.js';
import { extend } from 'underscore';

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);

    this.state = {
      event: this.props.event,
      isSaving: false,
      needSave: false,
      link: ''
    };
  }

  saveEvent() {
    if (this.state.event.published) {
      this.setState({needSave: true});
    } else {
      if (!this.state.event._id && this.props.event._id) {
       var newEvent = extend(this.props.event, this.state.event)
      this.props.actions.updateEvent(newEvent)
      } else {
        this.props.actions.updateEvent(this.state.event)
      }
    }
  }

  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange(key, value) {
    event = this.state.event
    event[key] = value
    this.setState(event)
    this.saveEvent()
  }

  render() {
    const { event, isSaving, needSave } = this.state;
    return (
      <div className='event--edit'>
        <EditNav
          event={event}
          isSaving={isSaving}
          needSave={needSave}
          saveEvent={this.saveEvent}
          deleteEvent={this.deleteEvent} />

        <section>
          <div className='event--edit__header'>New Event</div>
          <TextInput
            name='title'
            value={event.title || ''}
            required={true}
            onChange={this.onChange} />
          <TextInput
            name='venue'
            value={this.state.venue}
            onChange={this.onChange} />
        </section>

      </div>
    );
  }
}

export default EventEdit;