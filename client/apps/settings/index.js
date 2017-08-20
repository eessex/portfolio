import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/settings';
import SiteDescription from './components/site_description'

class Settings extends Component {

  componentWillMount() {
    this.props.actions.fetchSettings()
  }

  render() {
    const { actions } = this.props;
    const { isAuthenticated } = this.props.user;
    const { settings, loading } = this.props.settings;
    if (loading) {
      return (
        <div className='loading'>
          <div>Loading ...</div>
        </div>
      );
    } else {
      return (
        <div className='settings container'>
          <h3>Site Settings</h3>
          <SiteDescription
            settings={settings}
            actions={this.props.actions} />
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
)(Settings);