import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../actions/settings';
import SettingsInfo from './components/page_info'

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
          <p>Settings App</p>
          <SettingsInfo
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