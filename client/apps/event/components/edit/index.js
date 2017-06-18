import React, { Component } from 'react';
import { extend } from 'underscore';
const moment = require('moment');

import EditNav from './nav.js';
import TextInput from '../../../components/forms/text_input.js';
import DateInput from '../../../components/forms/date_input.js';
import CheckboxInput from '../../../components/forms/checkbox_input.js';

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.toggleEndDate = this.toggleEndDate.bind(this);

    this.state = {
      event: this.props.event,
      hasEndDate: false,
      isSaving: false,
      needSave: false,
      link: ''
    };
  }

  saveEvent() {
    if (!this.state.event._id && this.props.event._id) {
      var newEvent = extend(this.props.event, this.state.event)
      this.props.actions.updateEvent(newEvent)
     } else {
      this.props.actions.updateEvent(this.state.event)
    }
  }

  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange(key, value) {
    event = this.state.event
    event[key] = value
    var needSave = false
    if (this.props.event.published) {
      needSave = true
    }
    this.setState({event: event, needSave: needSave})
    this.saveEvent() //dont save if published
  }

  toggleEndDate() {
    if (this.state.hasEndDate) {
      this.onChange('end_date', null)
    }
    this.setState({hasEndDate: !this.state.hasEndDate})
  }

  renderEndDate(event) {
    if (event.end_date || this.state.hasEndDate) {
      return (
        <div className='end-date'>
          <DateInput
            name='end_date'
            label
            value={event.end_date || moment(new Date).add(1, 'days')}
            allDay={event.all_day || false}
            onChange={this.onChange} />
          <div onClick={this.toggleEndDate}>- Hide End Date</div>
        </div>
      )
    } else {
      return <div onClick={this.toggleEndDate}>+ Add End Date</div>
    }
  }

  render() {
    const { saving } = this.props;
    const { event, isSaving, needSave } = this.state;

    return (
      <div className='event--edit' style={ saving ? {background: 'cornsilk'} : null}>

        <EditNav
          event={event}
          isSaving={isSaving}
          needSave={needSave}
          saveEvent={this.saveEvent}
          deleteEvent={this.deleteEvent}
          onChange={this.onChange} />

        <section className='event--edit__form'>

          <TextInput
            name='title'
            value={event.title || ''}
            required={true}
            onChange={this.onChange} />

          <DateInput
            name='start_date'
            label
            value={event.start_date || new Date}
            required={true}
            allDay={event.all_day || false}
            onChange={this.onChange} />
          {this.renderEndDate(event)}
          <CheckboxInput
            label
            name='all_day'
            value={event.all_day || false}
            onChange={this.onChange} />

        </section>

      </div>
    );
  }
}

export default EventEdit;