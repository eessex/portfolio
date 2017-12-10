import FontAwesome from 'react-fontawesome'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import EditDate from './components/edit_date.js'
import EventDate from '../show/components/date.jsx'
import EditVenue from './components/edit_venue.js'
import TextInput from '../../components/forms/text_input.js'
import ValidationError from '../../components/forms/validation_error.js'
import { EditImagesList } from '../../components/forms/images/edit_images_list.jsx'
import { EditLinkList } from '../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../components/forms/edit_nav.jsx'
import { FileInput } from '../../components/forms/file_input/index.jsx'
import { PlainText } from '../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../components/forms/rich_text/index.jsx'
import { Venue } from '../../components/venue/index.jsx'
require('./index.scss')

export class EventEdit extends Component {
  constructor(props) {
    super(props)

    const { event } = this.props

    this.state = {
      event: event,
      hasEndDate: event.end_date ? true : false,
      needSave: false,
      editDates: false,
      editVenue: false,
      venue: event.venue ? event.venue : {
        name: null,
        address: null,
        city: null,
        state: null,
        country: null
      },
    }
  }

  onChange = (key, value) => {
    const event = this.state.event
    event[key] = value
    this.setState({ event, isSaved: false })
    this.maybeSaveEvent(event, key === 'published')
  }

  maybeSaveEvent = (event, forceSave) => {
    let isSaved = false

    if (forceSave || !event.published) {
      this.props.actions.updateEvent(event)
      isSaved = true
    }
    this.setState({event, isSaved})
  }

  onChangeVenue = (key, value) => {
    const venue = this.state.venue
    const keys = key.split('-')
    venue[keys[1]] = value
    this.setState({ venue })
    this.onChange('venue', venue)
  }

  toggleEndDate = () => {
    if (this.state.hasEndDate) {
      this.onChange('end_date', null)
    }
    this.setState({ hasEndDate: !this.state.hasEndDate })
  }
  toggleEditDate = () => {
    this.setState({editDates: !this.state.editDates})
  }
  toggleEditVenue = () => {
    this.setState({editVenue: !this.state.editVenue})
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

  renderError() {
    if (this.props.error) {
      if (this.props.error.name == 'ValidationError') {
        return <ValidationError errors={this.props.error.errors} />
      }
    }
  }

  renderModal() {
    if (this.state.editDates) {
      return <div className='modal__bg' onClick={this.toggleEditDate}></div>
    }
    if (this.state.editVenue) {
      return <div className='modal__bg' onClick={this.toggleEditVenue}></div>
    }
  }

  renderImages(images) {
    const { fetchUpload } = this.props.actions
    return images[0]
      ?
        <EditImagesList
          fetchUpload={fetchUpload}
          images={images}
          onChange={(value) => this.onChange('images', value)}
        />
      :
        <FileInput
          fetchUpload={fetchUpload}
          onChange={(image) => this.onChange('images', [image])}
        />
  }

  render() {
    const { saving, error, actions, uploading } = this.props
    const { event, venue, needSave } = this.state
    const { deleteEvent } = this.props.actions

    return (
      <div className='event--edit'>
        <EditNav 
          deleteitem={() => deleteEvent(event)}
          isSaved={!needSave}
          isSaving={saving}
          item={event}
          model='events'
          onPublish={() => this.onChange('published', !event.published || false)}
          saveItem={() => this.maybeSaveEvent(event, true)}
        />

        {this.renderError(error)}

        <Row className='event--edit__form'>
          <Col xs={12} lg={4} className='event__image'>
            {this.renderImages(event.images || [])}
          </Col>
          <Col xs={12} lg={7} className='event__body container'>
            <div className='event--show__header'>
              <PlainText
                content={event.title || ''}
                placeholder='Event title'
                className='Event__title h1'
                onChange={(value) => this.onChange('title', value)}
              />

              <div className='event--edit__date'>
                <EventDate
                  event={event}
                  onClick={this.toggleEditDate}
                  hasEndDate={this.state.hasEndDate}
                  toggleEditDate={this.toggleEditDate}
                  editDates={this.state.editDates}/>
                {this.renderDateInputs(event)}
                {this.renderModal()}
              </div>

              <div className='event--edit__venue'>
                {event.venue && (event.venue.name || event.venue.address) ?
                  <Venue venue={venue} onClick={this.toggleEditVenue} />
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
                placeholder='Event description'
              />
            </div>
            <div className='event--edit__links'>
              <EditLinkList
                links={event.links || []}
                onChange={(value) => this.onChange('links', value)}
              />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
