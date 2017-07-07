import React, { Component } from 'react';
import { extend } from 'underscore';
const moment = require('moment');

import EditNav from './nav.js';
import EventDate from '../show/event_date.js';
import TextInput from '../../../components/forms/text_input.js';
import RichText from '../../../components/forms/rich_text';
import DateInput from '../../../components/forms/date_input.js';
import CheckboxInput from '../../../components/forms/checkbox_input.js';
import ValidationError from '../../../components/forms/validation_error.js';
require('./index.scss');

class EventEdit extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.toggleEndDate = this.toggleEndDate.bind(this);
    this.toggleEditDate = this.toggleEditDate.bind(this);

    this.state = {
      event: this.props.event,
      hasEndDate: this.props.event.end_date ? true : false,
      needSave: false,
      editDates: false
    };
  }

  saveEvent(event, needSave=false) {
    if (this.props.event.published) {
      needSave = true
    } else {
      this.props.actions.updateEvent(event)
    }
    this.setState({event, needSave})
  }

  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange(key, value) {
    var newEvent = Object.assign({}, this.props.event, this.state.event);
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

  toggleEditDate() {
    this.setState({editDates: !this.state.editDates})
  }

  renderEndDate(event) {
    if (event.end_date || this.state.hasEndDate) {
      return (
        <div className='end-date'>
          <DateInput
            name='end_date'
            label
            value={event.end_date || null}
            allDay={event.all_day || false}
            onChange={this.onChange} />
          <div onClick={this.toggleEndDate}>- Remove End Date</div>
        </div>
      )
    } else {
      return <div onClick={this.toggleEndDate}>+ Add End Date</div>
    }
  }

  renderDateInputs(event) {
    if (this.state.editDates) {
      return (
        <div
          className='event--edit__date-input'
          style={{
            border: '1px solid',
            position: 'absolute',
            background: 'white',
            zIndex: 1
          }}>
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
          <button className='save' onClick={this.toggleEditDate}>Save</button>
        </div>
      )
    }
  }

  renderDateEdit() {
    if (!this.state.editDates) {
      return <button className='edit' onClick={this.toggleEditDate}>Edit</button>
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

        <section className='event--edit__form' style={{padding: 20}}>

          <TextInput
            name='title'
            value={event.title || ''}
            required={true}
            onChange={this.onChange} />

          <div className='event--edit__date'>
            <EventDate event={event} />
            {this.renderDateEdit()}
            {this.renderDateInputs(event)}
          </div>

          <RichText
            onChange={this.onChange}
            html={event.description}
            placeholder='Event description' />

        </section>

      </div>
    );
  }
}

export default EventEdit;