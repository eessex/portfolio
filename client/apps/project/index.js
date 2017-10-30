import * as Actions from '../../actions/project'
import Edit from './components/edit'
import Show from './components/show'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
require('./index.scss')

class Project extends Component {

  componentWillMount() {
    if (this.props.match.params.id == 'new') {
      this.props.actions.createProject()
    } else {
      this.props.actions.fetchProject(this.props.match.params.id)
    }
  }

  componentWillUnmount() {
    this.props.actions.resetProject()
  }

  render() {
    const { isAuthenticated } = this.props.user
    const { project, error, loading, saving, uploading } = this.props.project
    if (loading) {
      return (
        <div className='loading container'>
          <div>Loading ...</div>
        </div>
      )
    } else if (isAuthenticated) {
      return (
        <div className='project'>
          <Edit
            project={project}
            error={error}
            loading={loading}
            uploading={uploading}
            saving={saving}
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