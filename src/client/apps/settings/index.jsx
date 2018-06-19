import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/settings'
import SiteDescription from './components/site_description'
import { Loading } from 'client/components/layout/components/loading'
import { LayoutColumn } from 'client/components/layout/column'

class Settings extends Component {
  static propTypes = {
    fetchSettings: PropTypes.func,
    loading: PropTypes.bool,
    user: PropTypes.object
  }

  componentWillMount () {
    const {
      fetchSettings,
      user: { isAuthenticated }
    } = this.props

    if (isAuthenticated) {
      fetchSettings()
    } else {
      window.location.assign('/')
    }
  }

  render () {
    const { loading } = this.props

    return (
      <LayoutColumn label='Site Settings'>
        {loading
          ? <Loading />
          : <SiteDescription />
        }
      </LayoutColumn>
    )
  }
}

const mapStateToProps = (state) => ({
  loading: state.settings.loading,
  user: state.user
})

const mapDispatchToProps = {
  fetchSettings: Actions.fetchSettings
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
