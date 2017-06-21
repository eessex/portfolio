import React, { Component } from 'react';
import { extend } from 'underscore';
const moment = require('moment');

import EditNav from './nav.js';
import TextInput from '../../../components/forms/text_input.js';
import DateInput from '../../../components/forms/date_input.js';
import CheckboxInput from '../../../components/forms/checkbox_input.js';
import ValidationError from '../../../components/forms/validation_error.js';

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.toggleEndDate = this.toggleEndDate.bind(this);

    this.state = {
      event: this.props.event,
      hasEndDate: this.props.event.end_date ? true : false,
      needSave: false
    };
  }

  saveEvent(event, needSave=false) {
    if (this.props.event.published) {
      needSave = true
    } else {
      this.props.actions.updateEvent(event)
    }
    this.setState({event: event, needSave: needSave})
  }

  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange(key, value) {
    var newEvent = extend(this.props.event, this.state.event)
    newEvent[key] = value
    this.saveEvent(newEvent)
  }



  toggleEndDate() {
    if (this.state.hasEndDate) {
      this.onChange('end_date', null)
    }
    this.setState({hasEndDate: !this.state.hasEndDate})
  }

  renderError() {
    if (this.props.error) {
      if (this.props.error.name == 'ValidationError') {
        return <ValidationError errors={this.props.error.errors} />
      }
    }
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
    const { saving, error } = this.props;
    const { event, needSave } = this.state;

    return (
      <div className='event--edit' style={ saving ? {background: 'cornsilk'} : null}>

        <EditNav
          event={event}
          error={error}
          isSaving={saving}
          needSave={needSave}
          saveEvent={this.saveEvent}
          deleteEvent={this.deleteEvent}
          onChange={this.onChange} />

        {this.renderError(error)}

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