import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/user';
import Login from './login.js';
import Events from '../events';


class User extends Component {

  render() {
    const { isAuthenticated, error } = this.props.user;
    const { actions } = this.props;
    return (
      <div className='user'>
        <Login
          isAuthenticated={isAuthenticated}
          error={error}
          actions={actions} />
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