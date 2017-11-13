import React, { Component } from 'react'
import { Col, Row } from 'react-flexbox-grid'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import EditDate from './components/edit_date.js'
import EventDate from '../show/components/date.jsx'
import EditVenue from './components/edit_venue.js'
import EventVenue from '../show/components/venue.jsx'
import EditLink from './components/link.jsx'
import EditLinks from './components/links.jsx'
import FileInput from '../../../components/forms/file_input.js'
import FontAwesome from 'react-fontawesome'
import RichText from '../../../components/forms/rich_text'
import TextInput from '../../../components/forms/text_input.js'
import ValidationError from '../../../components/forms/validation_error.js'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { PlainText } from '../../../components/forms/rich_text/plain_text.js'
require('./index.scss')

export class EventEdit extends Component {
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


  onChange = (key, value) => {
    var newEvent = Object.assign({}, this.props.event, this.state.event)
    newEvent[key] = value
    if (key === 'images') {
      this.props.actions.updateEvent(newEvent)
    }
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
    const event = Object.assign({}, this.state.event)
    const images = event.images
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

  uploadProgress() {
      return(
        <FontAwesome
          className='file-uploading'
          name='circle-o-notch'
          size='2x'
          spin />
      )
  }

  renderImageUpload() {
    if (this.props.uploading) {
      this.uploadProgress()
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

  renderCoverImage(images) {
    if (images[0]) {
      return (
        this.renderSingleImage(images[0], 0, this.onRemoveImage)
      )
    }
  }

  renderSingleImage(image, i, onRemove) {
    return (
      <div className='event-images__item' key={i}>
        <ImageShow url={image.url} caption={image.caption} title={image.title} />
        <button className='remove--image' onClick={onRemove} name={i}>X</button>
      </div>
    )
  }

  renderAllImages(images) {
    if (images.length) {
      const listItems = images.map((image, i) => {
        if (i === 0) { return false }
        return this.renderSingleImage(image, i, this.onRemoveImage)
      })
      return (
        <div className='event-images'>
          <div className='event-images__list'>{listItems}</div>
          {this.renderImageUpload()}
        </div>
      )
    } else {
      return <div>{this.renderImageUpload()}</div>
    }
  }

  render() {
    const { saving, error, actions, uploading } = this.props
    const { event, venue, needSave, link, links } = this.state
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
          <Col sm={12} md={6} className='event__image'>
            {this.renderCoverImage(event.images || [])}
            {this.renderAllImages(event.images || [])}
          </Col>
          <Col sm={12} md={6} className='event__body container'>
            <div className='event--show__header'>
              <PlainText
                content={event.title}
                placeholder='Event title'
                className='Event__title h1'
                onChange={(value) => this.onChange('title', event)}
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
          </Col>
        </Row>

      </div>
    )
  }
}
