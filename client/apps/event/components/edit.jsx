import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/event'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { DatesModal } from '../../../components/dates/dates_modal.jsx'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'

import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { Body } from '../../../components/layout/components/body.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { imageIsVertical } from '../../../utils/index.js'
import { EventHeader } from './header.jsx'

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

  renderHeader = (isGrid) => {
    const { event } = this.state
    const images = event.images || []
    const coverImage = !isGrid && images.length > 0 ? images[0] : undefined

    return (
      <EventHeader
        coverImage={coverImage}
        event={event}
        setEditing={(isEditing) => this.setState({ isEditing })}
      />
    )
  }

  renderBody = () => {
    const { event } = this.state

    return (
      <Body
        body={event.description}
        onChange={(value) => this.onChange('description', value)}
      />
    )
  }

  renderMedia = () => {
    const { event } = this.state
    const embed_codes = event.embed_codes || []

    return (
      <EmbedList embed_codes={embed_codes} />
    )
  }

  render() {
    const { event, isEditing, isSaved } = this.state
    const { actions, isSaving } = this.props
    const { deleteEvent, fetchUpload } = actions

    const embed_codes = event.embed_codes || []
    const images = event.images || []
    const isGrid = images.length > 0 && imageIsVertical(images[0])

    const layoutProps = {
      body: this.renderBody,
      coverImage: isGrid && images[0],
      header: () => this.renderHeader(isGrid),
      label: 'Event',
      labelLink: '/events',
      media: this.renderMedia
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
          onPublish={() => this.onChange('published', !event.published)}
          saveItem={() => this.maybeSaveEvent(event, true)}
          onClickImage={() => this.setState({isEditing: 'images'})}
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
        />

        {isGrid
          ? <LayoutGrid {...layoutProps} />
          : <LayoutColumn {...layoutProps} />
        }

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(editing) => this.setState({isEditing: editing})}
          />
        }

        {isEditing === 'date' &&
          <DatesModal
            {...dateProps}
            onChange={this.onChange}
            hasEndDate={!this.state.hasEndDate}
            setEditing={(editing) => this.setState({isEditing: editing})}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={event}
            fetchUpload={fetchUpload}
            onChange={(value) => this.onChange('images', value)}
            setEditing={(editing) => this.setState({isEditing: editing})}
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