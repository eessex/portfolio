import React, { Component } from 'react';
import TextInput from '../../../components/forms/text_input.js'
import EditNav from './nav.js'

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.firstSaveEvent = this.firstSaveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);

    this.state = {
      event: this.props.event,
      isSaving: false,
      needSave: false,
      link: ''
    };
  }

  firstSaveEvent() {
    this.props.actions.createEvent(this.state.event)
    window.location.replace('/events/' + this.state.event._id)
  }

  saveEvent() {
    if (this.state.event.published) {
      this.setState({needSave: true});
    } else {
      this.setState({isSaving: true})
      if (this.props.isNew) {
        this.firstSaveEvent(this.state.event)
      } else {
        this.props.actions.updateEvent(this.state.event)
      }
      this.setState({isSaving: false})
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
          isNew={this.props.isNew}
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