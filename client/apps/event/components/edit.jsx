import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/event'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { DatesModal } from '../../../components/dates/dates_modal.jsx'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { Item } from '../../../components/item/index.jsx'
import { TextModal } from '../../../components/text/text_modal.jsx'
import { VenueModal } from '../../../components/venue/venue_modal.jsx'
import { ItemHeader } from '../../../components/layout/components/header.jsx'

class EventEdit extends Component {
  state = {
    event: this.props.event.event,
    isEditing: null,
    isSaved: true
  }

  onChange = (key, value) => {
    const event = this.state.event
    event[key] = value

    this.setState({ event, isSaved: false })
    this.maybeSaveEvent(event, key === 'published')
  }

  maybeSaveEvent = (event, forceSave) => {
    const { updateEvent } = this.props.actions

    let isSaved = false

    if (forceSave || !event.published) {
      updateEvent(event)
      isSaved = true
    }
    this.setState({event, isSaved})
  }

  render() {
    const { event, isEditing, isSaved } = this.state
    const { actions, isSaving } = this.props
    const { deleteEvent, fetchUpload } = actions

    const embed_codes = event.embed_codes || []

    const layoutProps = {
      item: event,
      label: 'Event',
      labelLink: true,
      model: 'events',
      onChange: this.onChange,
      setEditing: (isEditing) => this.setState({ isEditing })
    }

    const {
      all_day,
      end_date,
      start_date
    } = event
    const dateProps = {
      all_day,
      end_date,
      start_date
    }

    return (
      <div className='EventEdit'>

        <EditNav 
          deleteitem={() => deleteEvent(event)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={event}
          model='events'
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
          onClickImage={() => this.setState({isEditing: 'images'})}
          onPublish={() => this.onChange('published', !event.published)}
          saveItem={() => this.maybeSaveEvent(event, true)}
        />

        <Item {...layoutProps} />

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'dates' &&
          <DatesModal
            {...dateProps}
            onChange={this.onChange}
            hasEndDate={!this.state.hasEndDate}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={event}
            fetchUpload={fetchUpload}
            onChange={(value) => this.onChange('images', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'title' &&
          <TextModal
            className='h1'
            label='Title'
            text={event.title}
            onChange={(value) => this.onChange('title', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'venue' &&
          <VenueModal
            venue={event.venue}
            onChange={(value) => this.onChange('venue', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventEdit)
