import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/events';
import EventsList from './components/events_list.js'

class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: {}
    }
  }

  componentWillMount() {
    var query = this.state.query
    if (!this.props.user.isAuthenticated) {
      query = {published: true}
    }
    this.setState({query: query})
    this.props.actions.fetchEvents(query)
  }

  render() {
    const { isAuthenticated } = this.props.user;
    const { list, loading } = this.props.events;
    const { actions } = this.props;
    if (loading) {
      return (
        <div className='events'>
          <div>Loading ...</div>
        </div>
      );
    } else {
      return (
        <div className='events'>
          <EventsList
            events={list}
            actions={actions}
            isAuthenticated={isAuthenticated} />
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
)(Events);