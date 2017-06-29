import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/event';
import Edit from './components/edit'
import Show from './components/show'

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
    const { isAuthenticated } = this.props.user;
    const { event, error, loading, saving } = this.props.event;
    if (loading) {
      return (
        <div className='event'>
          <div>Loading ...</div>
        </div>
      );
    } else if (isAuthenticated) {
      return (
        <div className='event'>
          <Edit
            event={event}
            error={error}
            loading={loading}
            saving={saving}
            actions={this.props.actions} />
        </div>
      );
    } else {
      return (
        <div className='event'>
          <Show
            event={event}
            loading={loading} />
        </div>
      )
    }
  }
}
const mapStateToProps = (state) => ({
  ...state
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Event);