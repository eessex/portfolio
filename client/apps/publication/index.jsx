import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/publication'
import { PublicationEdit } from './components/edit.jsx'
import { PublicationShow } from './components/show.jsx'

class Publication extends Component {
  componentWillMount() {
    const { actions, match } = this.props
    actions.fetchPublication(match.params.id)
  }

  componentWillUnmount() {
    this.props.actions.resetPublication()
  }

  render() {
    const { isAuthenticated } = this.props.user
    const {
      publication,
      error,
      loading,
      saving,
      uploading
    } = this.props.publication
    const label = this.props.match.path.replace('/','') === 'publications' ? 'Publications' : 'Releases'

    if (loading) {
      return (
        <div className='Loading' />
      )

    } else {
      return (
        <div className='Publication'>
          {isAuthenticated
            ? <PublicationEdit
                publication={publication}
                label={label}
                error={error}
                loading={loading}
                uploading={uploading}
                isSaving={saving}
                actions={this.props.actions}
              />

            : <PublicationShow
                publication={publication}
                label={label}
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
)(Publication)