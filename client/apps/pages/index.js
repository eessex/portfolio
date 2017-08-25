import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../../actions/events';
require('./index.scss');

class Pages extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { isAuthenticated } = this.props.user;
    const { settings, loading } = this.props.settings;
    const { actions } = this.props;
    if (loading) {
      return (
        <div className='loading container'>
          <div>Loading ...</div>
        </div>
      );
    } else {
      return (
        <div className='about'>
          <div
            className='about__description'
            dangerouslySetInnerHTML={{__html: settings.about.description}} />
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
)(Pages);