import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../actions/settings'
import { AboutEdit } from './about/edit.jsx'
import { AboutShow } from './about/show.jsx'
require('./index.scss')

class Pages extends Component {
  render() {
    const { isAuthenticated } = this.props.user
    const { settings, loading, saving } = this.props.settings
    const { actions } = this.props

    if (loading) {
      return (
        <div className='Loading' />
      )
    } else {
      return (
        <div className='about'>
          {isAuthenticated
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