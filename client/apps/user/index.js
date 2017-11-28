import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/user';
import Login from './login.js';
import NewUser from './new.js';

class User extends Component {
  getUserComponent() {
    const { isAuthenticated, error } = this.props.user;
    const { actions } = this.props;
    if (this.props.location.pathname == '/login') {
      return (
        <Login
          isAuthenticated={isAuthenticated}
          error={error}
          actions={actions} />
      )
    } else if (this.props.location.pathname == '/new/user') {
      return (
        <NewUser
          isAuthenticated={isAuthenticated}
          error={error}
          actions={actions} />
      )
    }
  }

  render() {
    const { isAuthenticated, error } = this.props.user;
    const { actions } = this.props;
    return (
      <div className='user container'>
        {this.getUserComponent()}
      </div>
    );
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