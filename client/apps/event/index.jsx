import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/event'
import EventEdit from './components/edit.jsx'
import { EventShow }  from './components/show.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'
import { Item } from '../../components/item/index.jsx'

class Event extends Component {
  componentWillMount() {
    const { actions, match } = this.props

    if (match.params.id == 'new') {
      actions.createEvent()
    } else {
      actions.fetchEvent(match.params.id)
    }
  }

  componentWillUnmount() {
    this.props.actions.resetEvent()
  }

  render() {
    const { isAuthenticated } = this.props.user

    const {
      event,
      error,
      loading,
      saving,
      uploading
    } = this.props.event

    return (
      <div className='Event'>
        {loading
          ? <Loading />

          : isAuthenticated
            ? <EventEdit />
            : <Item item={event} />
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
)(Event)
