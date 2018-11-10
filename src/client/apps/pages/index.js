import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from 'client/actions/settings'
import { Loading } from 'client/components/layout/components/loading'
import { AboutEdit } from './about/edit.jsx'
import { AboutShow } from './about/show.jsx'

class Pages extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    loading: PropTypes.bool,
    saving: PropTypes.bool,
    settings: PropTypes.object
  }

  render () {
    const {
      isAuthenticated,
      loading,
      saving,
      settings
    } = this.props
    const { actions } = this.props

    return (
      <div>
        {loading
          ? <Loading />
          : isAuthenticated
            ? (
              <AboutEdit
                actions={actions}
                saving={saving}
                settings={settings}
              />
            ) : <AboutShow settings={settings} />
        }
      </div>
    )
  }
}

const mapStateToProps = ({ userReducer, settingsReducer }) => ({
  isAuthenticated: userReducer.isAuthenticated,
  loading: settingsReducer.loading,
  saving: settingsReducer.saving,
  settings: settingsReducer.settings
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pages)
