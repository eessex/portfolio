import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/event'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EditNav } from '../../components/forms/edit_nav.jsx'
import { EmbedModal } from '../../components/embeds/embed_modal.jsx'
import { ImagesEdit } from '../../components/images/images_edit.jsx'

class EventEdit extends Component {
  state = {
    event: this.props.event,
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

    return (
      <div className='EventEdit'>
        EventEdit
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

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
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
