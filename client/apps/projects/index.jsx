import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../actions/projects'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { LayoutColumn } from '../../components/layout/column.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

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
    const { actions, projects } = this.props
    const { isAdmin } = this.state
    const { loading } = projects
    const { list } = projects

    return (
      <div className='Projects'>
        {loading
          ? <Loading />

          : <LayoutColumn
              className='Projects'
              label='Projects'
            >
              {isAdmin &&
                <NewButton
                  model='Project'
                  onCreate={actions.createProject}
                />
              }
              <ItemsList
                model='projects'
                list={list || []}
              />
          </LayoutColumn>
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
)(Projects)
