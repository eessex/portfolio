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
    this.onChangeVenue = this.onChangeVenue.bind(this);
    this.saveEvent = this.saveEvent.bind(this);
    this.maybeSaveEvent = this.maybeSaveEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.toggleEndDate = this.toggleEndDate.bind(this);
    this.toggleEditDate = this.toggleEditDate.bind(this);
    this.onChangeLink = this.onChangeLink.bind(this);
    this.onCreateLink = this.onCreateLink.bind(this);
    this.setEditLink = this.setEditLink.bind(this);

    this.state = {
      event: this.props.event,
      hasEndDate: this.props.event.end_date ? true : false,
      needSave: false,
      editDates: false,
      venue: this.props.event.venue ? this.props.event.venue : { name: '', address: ''},
      link: { title: '', url: ''},
      links: this.props.event.links ? this.props.event.links : [],
      editLink: null,
    };
  }

  maybeSaveEvent(event, needSave=false) {
    if (event.published) {
      needSave = true
    } else {
      this.props.actions.updateEvent(event)
    }
    this.setState({event, needSave})
  }

  saveEvent(event) {
    this.props.actions.updateEvent(event)
    this.setState({event, needSave: false})
  }

  deleteEvent() {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange(key, value) {
    var newEvent = Object.assign({}, this.props.event, this.state.event);
    newEvent[key] = value
    this.maybeSaveEvent(newEvent)
  }

  onChangeVenue(key, value) {
    const venue = this.state.venue
    const keys = key.split('-')
    venue[keys[1]] = value
    this.setState({ venue })
    this.onChange('venue', venue)
  }

  onChangeLink(key, value, index) {
    const links = this.state.links
    const link = index ? links[index] : this.state.link
    const keys = key.split('-')
    link[keys[1]] = value
    if (index) {
      links[index] = link
      this.onChange('links', links)
    } else {
      this.setState({ link })
    }
  }

  onCreateLink() {
    const link = this.state.link
    const links = this.state.links
    links.push(link)
    this.onChange('links', links)
    this.setState({ link: { title: '', url: ''} })
    this.forceUpdate()
  }

  toggleEndDate() {
    if (this.state.hasEndDate) {
      this.onChange('end_date', null)
    }
    this.setState({ asEndDate: !this.state.hasEndDate })
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
  setEditLink(e) {
    const index = parseInt(e.target.name.replace('edit-', ''))
    this.setState({editLink: index})
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
        </div>
      )
    }
  }

  renderDateInputs(event) {
    const actionFlex = this.props.event.published ? 'space-between' : 'flex-end'
    if (this.state.editDates) {
      return (
        <div className='event--edit__date-input'>
          <DateInput
            name='start_date'
            label
            value={event.start_date || new Date}
            required={true}
            allDay={event.all_day || false}
            onChange={this.onChange} />
          {this.renderEndDate(event)}
          <div className='actions' style={{justifyContent: actionFlex}}>
            {this.renderDateSave()}
            <div className='actions--toggle'>
              <CheckboxInput
                label='Hide End Date'
                name='end_date'
                value={!this.state.hasEndDate}
                onChange={this.toggleEndDate} />
              <CheckboxInput
                label='Hide Time'
                name='all_day'
                value={event.all_day || false}
                onChange={this.onChange} />
              </div>
          </div>
        </div>
      )
    }
  }

  renderModal() {
    if (this.state.editDates) {
      return <div className='modal__bg' onClick={this.toggleEditDate}></div>
    }
  }
  renderDateSave() {
    if (this.props.event.published) {
      return <button className='save' onClick={this.maybeSaveEvent}>Save</button>
    }
  }
  renderDateEdit() {
    if (!this.state.editDates) {
      return <button className='edit' onClick={this.toggleEditDate}>Edit</button>
    }
  }
  renderLinkSave() {
    return <button className='save' onClick={this.onCreateLink}>Save</button>
  }
  renderLinkActions(link, index) {
    if (this.state.editLink != index) {
      return <button className='edit' name={'edit-' + index} onClick={this.setEditLink}>Edit</button>
    } else {
      return this.renderLinkEdit(link, index)
    }
  }
  renderSavedLinks(links) {
    const listItems =  links.map( (link, index) => this.renderSavedLink(link, index) )
    return (
      <div className='event--edit__links'>
        <h5>Links</h5>
        {listItems}
      </div>
    )
  }

  renderSavedLink(link, index) {
    return (
      <div className='event--edit__link-preview' key={'link-' + index}>
        <a href={link.url}>{link.title}</a>
        {this.renderLinkActions(link, index)}
      </div>
    )
  }

  renderLinkEdit(link, index) {
    return (
      <div className='event--edit__link-edit'>
        <TextInput
          name='link-title'
          key={index || 'new-link'}
          value={link ? link.title : this.state.link.title}
          onChange={this.onChangeLink} />
        <TextInput
          name='link-url'
          value={link ? link.url : this.state.link.url}
          onChange={this.onChangeLink} />
        {this.renderLinkSave(index || 'new-link')}
      </div>
    )
  }

  render() {
    const { saving, error } = this.props;
    const { event, needSave, link, links } = this.state;

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
          <div className='event--show__header container'>
            <TextInput
              name='title'
              value={event.title || ''}
              required={true}
              textarea={true}
              onChange={this.onChange} />

            <div className='event--edit__date'>
              <EventDate event={event} />
              {this.renderDateEdit()}
              {this.renderDateInputs(event)}
              {this.renderModal()}
            </div>

            <div className='event--edit__venue'>
              <TextInput
                name='venue-name'
                value={event.venue ? event.venue.name : ''}
                onChange={this.onChangeVenue} />
              <TextInput
                name='venue-address'
                value={event.venue ? event.venue.address : ''}
                onChange={this.onChangeVenue} />
            </div>
          </div>
          <div className='event--edit__description container'>
            <RichText
              onChange={this.onChange}
              html={event.description}
              placeholder='Event description' />
          </div>
          {this.renderSavedLinks(links)}
          {this.renderLinkEdit()}
        </section>

      </div>
    );
  }
}

export default EventEdit;