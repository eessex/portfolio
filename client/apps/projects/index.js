import { ProjectList } from './components/project_list'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/projects'
require('./index.scss')

class Projects extends Component {
  constructor(props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : {published: true}
    props.actions.fetchProjects(query)

    this.state = {
      query,
      isAdmin
    }
  }

  render() {
    const { isAdmin } = this.state
    const { settings, loading } = this.props.settings
    const { list } = this.props.projects
    const { actions } = this.props
    if (loading) {
      return (
        <div className='loading container'>
          <div>Loading ...</div>
        </div>
      )
    } else {
      return (
        <div className='projects'>
          <ProjectList projects={list} />
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
)(Projects)