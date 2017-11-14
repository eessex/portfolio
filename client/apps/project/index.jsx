import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/project'
import { ProjectEdit } from './components/edit/index.jsx'
import Show from './components/show/index.jsx'

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

    if (loading) {
      return (
        <div className='loading container'>
          <div>Loading ...</div>
        </div>
      )

    } else if (isAuthenticated) {
      return (
        <div className='project'>
          <ProjectEdit
            project={project}
            error={error}
            loading={loading}
            uploading={uploading}
            isSaving={saving}
            actions={this.props.actions} />
        </div>
      )

    } else {
      return (
        <div className='project'>
          <Show
            project={project}
            loading={loading} />
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
)(Project)