import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../actions/settings'
import { Loading } from '../../components/layout/components/loading.jsx'
import { AboutEdit } from './about/edit.jsx'
import { AboutShow } from './about/show.jsx'

class Pages extends Component {
  static propTypes = {
    actions: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    loading: PropTypes.bool,
    saving: PropTypes.bool,
    settings: PropTypes.bool
  }

  render () {
    const { isAuthenticated, loading, saving, settings } = this.props
    const { actions } = this.props

    return (
      <div className='Pages'>
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

const mapStateToProps = state => ({
  isAuthenticated: state.user,
  loading: state.settings.loading,
  saving: state.settings,
  settings: state.settings
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pages)
