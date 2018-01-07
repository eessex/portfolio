import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/project'
import { Loading } from '../../components/layout/components/loading.jsx'
import { ProjectEdit } from './components/edit.jsx'
import { ProjectShow } from './components/show.jsx'

class Project extends Component {
  componentWillMount() {
    this.props.actions.fetchProject(this.props.match.params.id)
  }

  componentWillUnmount() {
    this.props.actions.resetProject()
  }

  render() {
    const { isAuthenticated } = this.props.user
    const {
      project,
      error,
      loading,
      saving,
      uploading
    } = this.props.project

    return (
      <div className='Project'>
        {loading
          ? <Loading />

          : isAuthenticated
            ? <ProjectEdit
                project={project}
                error={error}
                loading={loading}
                uploading={uploading}
                isSaving={saving}
                actions={this.props.actions}
              />
            : <ProjectShow project={project} />
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
)(Project)
