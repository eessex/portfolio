import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/event'
import EventEdit from './edit.jsx'
import { EventShow }  from './show/index.jsx'

class Event extends Component {
  componentWillMount() {
    if (this.props.match.params.id == 'new') {
      this.props.actions.createEvent()
    } else {
      this.props.actions.fetchEvent(this.props.match.params.id)
    }
  }

  componentWillUnmount() {
    this.props.actions.resetEvent()
  }

  render() {
    const { isAuthenticated } = this.props.user
    const { event, error, loading, saving, uploading } = this.props.event
    if (loading) {
      return (
        <div className='Loading' />
      )
    } else if (isAuthenticated) {
      return (
        <div className='Event'>
          <EventEdit
            event={event}
            error={error}
            loading={loading}
            uploading={uploading}
            saving={saving}
            actions={this.props.actions} />
        </div>
      )
    } else {
      return (
        <div className='Event'>
          <EventShow
            event={event}
            loading={loading} />
        </div>
      )
    }
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
)(Event)
