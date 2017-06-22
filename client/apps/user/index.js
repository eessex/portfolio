import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/user';
import Login from './login.js';

class User extends Component {
  render() {
    const { user, loading, isAuthenticated } = this.props.user;
    const { actions } = this.props;
    if (loading) {
      return (
        <div className='events'>
          <div>Loading ...</div>
        </div>
      );
    } else if (!isAuthenticated) {
      return (
        <div className='user'>
          <Login
            actions={actions} />
        </div>
      );
    } else {
      return (
        <div>This is a homepage</div>
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
)(User);