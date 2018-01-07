import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/settings'
import SiteDescription from './components/site_description'

class Settings extends Component {
  componentWillMount() {
    this.props.actions.fetchSettings()
  }

render() {
  const { actions, user } = this.props
  const { isAuthenticated } = user
  const { settings, loading } = this.props.settings

    return (
      <div className='Settings'>
        {loading
          ? <Loading />

          : <div>
              <h3>Site Settings</h3>
              <SiteDescription
                settings={settings}
                actions={actions}
              />
            </div>
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
)(Settings)
