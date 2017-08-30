import React, { Component } from 'react'

import EditNav from './nav.js'
import EditDate from './components/edit_date.js'
import EventDate from '../show/components/date.jsx'
import EventImage from '../show/components/image.jsx'
import EditVenue from './components/edit_venue.js'
import EventVenue from '../show/components/venue.jsx'
import EditLink from './components/link.jsx'
import EditLinks from './components/links.jsx'
import FileInput from '../../../components/forms/file_input.js'
import RichText from '../../../components/forms/rich_text'
import TextInput from '../../../components/forms/text_input.js'
import ValidationError from '../../../components/forms/validation_error.js'
require('./index.scss')

class EventEdit extends Component {
  constructor(props) {
    super(props)

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
      image: { title: '', url: '', aspect: null }
    }
  }

  maybeSaveEvent = (event, needSave=false) => {
    if (event.published) {
      needSave = true
    } else {
      this.props.actions.updateEvent(event)
    }
    this.setState({event, needSave})
  }

  saveEvent = (event) => {
    this.props.actions.updateEvent(event)
    this.setState({event, needSave: false})
  }

  deleteEvent = () => {
    this.props.actions.deleteEvent(this.state.event)
    window.location.replace('/events/')
  }

  onChange = (key, value) => {
    var newEvent = Object.assign({}, this.props.event, this.state.event)
    newEvent[key] = value
    this.maybeSaveEvent(newEvent)
  }

  onChangeVenue = (key, value) => {
    const venue = this.state.venue
    const keys = key.split('-')
    venue[keys[1]] = value
    this.setState({ venue })
    this.onChange('venue', venue)
  }

  onChangeImageUrl = (key, value) => {
    const image = this.state.image
    const keys = key.split('-')
    image[keys[1]] = value
    const images = this.state.event.images
    images.push(image)
    this.onChange('images', images)
  }

  onRemoveImage = (e) => {
    const images = this.state.event.images
    images.splice(e.target.name, 1)
    this.onChange('images', images)
  }


  onChangeLink = (key, value) => {
    const link = this.state.link
    const keys = key.split('-')
    link[keys[1]] = value
    this.setState({ link })
  }

  onCreateLink = () => {
    const link = this.state.link
    const links = this.state.event.links || []
    links.push(link)
    this.onChange('links', links)
    this.setState({ link: { title: '', url: ''}, editLink: false })
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
  toggleEditLink = () => {
    this.setState({editLink: !this.state.editLink})
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

  renderLinkInput(link, index) {
    return (
      <div className='event--edit__link-input'>
        <EditLink link={link} onChange={this.onChangeLink} index={index} />
        <button className='save' onClick={this.onCreateLink}>Save</button>
      </div>
    )
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
    if (this.state.editLink) {
      return <div className='modal__bg' onClick={this.toggleEditLink}></div>
    }
  }

  renderCoverImage(images) {
    if (images[0] || this.state.image.url) {
      return (
        <div>
          <EventImage image={images[0] || this.state.image} />
          <button className='remove--image' onClick={this.onRemoveImage} name='0'>X</button>
        </div>
      )
    } else {
      return (
        <FileInput
          name='image-url'
          accept="image/jpeg, image/png"
          actions={this.props.actions}
          upload={this.props.upload}
          onChange={this.onChangeImageUrl} />
      )
    }
  }

  render() {
    const { saving, error, actions, upload } = this.props
    const { event, venue, needSave, link, links } = this.state

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
          <div className='event__image'>
            {this.renderCoverImage(event.images || [])}
          </div>
          <div className='event__body container'>
            <div className='event--show__header'>
              <TextInput
                name='title'
                value={event.title || ''}
                required={true}
                textarea={true}
                onChange={this.onChange} />

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

            <EditLinks links={event.links || []} onChange={this.onChange} />

            <div className='event--edit__link'>
              <p
                className='event--edit__placeholder'
                onClick={this.toggleEditLink}>Add Link +</p>
              {this.state.editLink && this.renderLinkInput(link)}
              {this.renderModal()}
            </div>
          </div>
        </section>

      </div>
    )
  }
}

export default EventEdit
