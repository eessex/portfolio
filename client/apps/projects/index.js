import { ProjectList } from './components/project_list'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/projects'
require('./index.scss')

class Projects extends Component {
  // static fetchData(store) {
  //   debugger
  //   return store.dispatch(fetchProjects())
  // }

  constructor(props) {
    super(props)

    this.state = {
      query: {}
    }
  }

  componentWillMount() {
    var query = this.state.query
    if (!this.props.user.isAuthenticated) {
      query = {published: true}
    }
    this.setState({query: query})
    this.props.actions.fetchProjects(query)
  }

  render() {
    const { isAuthenticated } = this.props.user
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