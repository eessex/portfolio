import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/projects'
import { ItemsList } from '../components/items_list/index.jsx'
import { NewButton } from '../components/header/components/new_button.jsx'

class Projects extends Component {
  constructor(props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : {published: true}

    this.state = {
      query,
      isAdmin
    }
  }

  componentWillMount() {
    this.props.actions.fetchProjects(this.state.query)
  }

  render() {
    const { actions } = this.props    
    const { isAdmin } = this.state
    const { loading } = this.props.settings
    const { list } = this.props.projects

    if (loading) {
      return (
        <div className='loading container'>
          <div>Loading ...</div>
        </div>
      )

    } else {
      return (
        <div className='projects'>
          {isAdmin &&
            <NewButton
              model='Project'
              onCreate={actions.createProject}
            />
          }
          <ItemsList
            title
            model='projects'
            list={list}
          />
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