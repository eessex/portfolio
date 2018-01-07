import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/publication'
import { Loading } from '../../components/layout/components/loading.jsx'
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
    const { match, user } = this.props
    const { isAuthenticated } = user
    const {
      publication,
      error,
      loading,
      saving,
      uploading
    } = this.props.publication

    const label = match.path.replace('/','') === 'publications' ? 'Publications' : 'Releases'

    return (
      <div className='Publication'>
        {loading
          ? <Loading />

          : isAuthenticated
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