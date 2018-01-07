import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../actions/settings'
import { Loading } from '../../components/layout/components/loading.jsx'
import { AboutEdit } from './about/edit.jsx'
import { AboutShow } from './about/show.jsx'

class Pages extends Component {
  render() {
    const { isAuthenticated } = this.props.user
    const { settings, loading, saving } = this.props.settings
    const { actions } = this.props

    return (
      <div className='Pages'>
        {loading
          ? <Loading />
          : isAuthenticated
            ? <AboutEdit
                actions={actions}
                saving={saving}
                settings={settings}
              />
            : <AboutShow
                settings={settings}
              />
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
)(Pages)
