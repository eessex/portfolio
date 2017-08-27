import React, { Component } from 'react';
import { extend } from 'underscore';
const moment = require('moment');

import CheckboxInput from '../../../components/forms/checkbox_input.js'
import DateInput from '../../../components/forms/date_input.js'
import EditNav from './nav.js'
import EditDate from './components/edit_date.js'
import EventDate from '../show/components/date.jsx'
import EditVenue from './components/edit_venue.js'
import EventVenue from '../show/components/venue.jsx'
import EditLink from './components/edit_link.js'
import RichText from '../../../components/forms/rich_text'
import TextInput from '../../../components/forms/text_input.js'
import ValidationError from '../../../components/forms/validation_error.js'
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
    this.toggleEditVenue = this.toggleEditVenue.bind(this);
    this.toggleEditLink = this.toggleEditLink.bind(this);
    this.onChangeLink = this.onChangeLink.bind(this);
    this.onCreateLink = this.onCreateLink.bind(this);
    this.setEditLink = this.setEditLink.bind(this);

    this.state = {
      event: this.props.event,
      hasEndDate: this.props.event.end_date ? true : false,
      needSave: false,
      editDates: false,
      editVenue: false,
      editLink: false,
      venue: this.props.event.venue ? this.props.event.venue : {
        name: null,
        address: null,
        city: null,
        state: null,
        country: null},
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
    const link = index || index === 0 ? links[index] : this.state.link
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
    this.setState({ link: { title: '', url: ''}, editLink: false })
  }

  toggleEndDate() {
    if (this.state.hasEndDate) {
      this.onChange('end_date', null)
    }
    this.setState({ hasEndDate: !this.state.hasEndDate })
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
  toggleEditVenue() {
    this.setState({editVenue: !this.state.editVenue})
  }
  toggleEditLink() {
    const editLink = this.state.editLink || (this.state.editLink === 0) ? false : 'new'
    this.setState({editLink})
  }
  setEditLink(e) {
    const index = parseInt(e.target.name.replace('edit-', ''))
    this.setState({editLink: index})
  }

  renderDateInputs(event) {
    if (this.state.editDates) {
      return (
        <div className='event--edit__date-input'>
          <EditDate
            event={event}
            onChange={this.onChange}
            hasEndDate={!this.state.hasEndDate}
            toggleEndDate={this.toggleEndDate} />
        </div>
      )
    }
  }

  renderVenueInputs(event) {
    if (this.state.editVenue) {
      return (
        <div className='event--edit__venue-input'>
          <EditVenue event={event} onChangeVenue={this.onChangeVenue} />
        </div>
      )
    }
  }

  renderLinkInput(link, onSave, index) {
    return (
      <div className='event--edit__link-input'>
        <EditLink link={link} onChange={this.onChangeLink} index={index} />
        <button className='save' onClick={onSave}>Save</button>
      </div>
    )
  }

  renderModal() {
    if (this.state.editDates) {
      return <div className='modal__bg' onClick={this.toggleEditDate}></div>
    }
    if (this.state.editVenue) {
      return <div className='modal__bg' onClick={this.toggleEditVenue}></div>
    }
    if (this.state.editLink) {
      return <div className='modal__bg' onClick={this.toggleEditLink}></div>
    }
  }
  renderLinkActions(link, index) {
    if (this.state.editLink === index) {
      return this.renderLinkInput(link, this.toggleEditLink, index)
    } else {
      return <button className='edit' name={'edit-' + index} onClick={this.setEditLink}>Edit</button>
    }
  }
  renderSavedLinks(links) {
    const listItems =  links.map( (link, index) => this.renderSavedLink(link, index) )
    return (
      <div className='event--edit__links'>
        {listItems}
      </div>
    )
  }

  renderSavedLink(link, index) {
    return (
      <div className='event--edit__link' key={index}>
        <a href={link.url}>{link.title || link.url}</a>
        {this.renderLinkActions(link, index)}
        {this.renderModal()}
      </div>
    )
  }

  render() {
    const { saving, error } = this.props;
    const { event, venue, needSave, link, links } = this.state;

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
          <div className='event--show__header'>
            <TextInput
              name='title'
              value={event.title || ''}
              required={true}
              textarea={true}
              onChange={this.onChange} />

            <div className='event--edit__date'>
              <EventDate event={event} onClick={this.toggleEditDate} />
              {this.renderDateInputs(event)}
              {this.renderModal()}
            </div>

            <div className='event--edit__venue'>
              {event.venue && (event.venue.name || event.venue.address) ?
                <EventVenue venue={venue} onClick={this.toggleEditVenue} />
                :
                <h4
                  className='event--edit__placeholder'
                  onClick={this.toggleEditVenue}>Add Venue +</h4>}
              {this.renderVenueInputs(event)}
              {this.renderModal()}
            </div>
          </div>
          <div className='event--edit__description'>
            <RichText
              onChange={this.onChange}
              html={event.description}
              placeholder='Event description' />
          </div>
          <br/>
          {this.renderSavedLinks(links)}
          <div className='event--edit__link'>
            <p
              className='event--edit__placeholder'
              onClick={this.toggleEditLink}>Add Link +</p>
            {this.state.editLink === 'new' && this.renderLinkInput(link, this.onCreateLink)}
            {this.renderModal()}
          </div>
          <p>Images coming soon</p>
        </section>

      </div>
    )
  }
}

export default EventEdit