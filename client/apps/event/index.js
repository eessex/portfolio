import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/event';
import EventContainer from './components/event_container.js'

class Event extends Component {

  componentWillMount() {
    this.props.actions.fetchEvent(this.props.match.params.id)
  }

  render() {
    const { event, loading } = this.props.event;
    if (loading) {
      return (
        <div className='events'>
          <div>Loading ...</div>
        </div>
      );
    } else {
      if (this.props.match.params.id == 'new') {
        var isNew = true
      }
      return (
        <div className='events'>
          <EventContainer event={event} isNew={isNew} actions={this.props.actions} />
        </div>
      );
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