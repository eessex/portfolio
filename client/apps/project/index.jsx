import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { Item } from '../../components/item/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'
import ProjectEdit from './components/edit.jsx'

class Project extends Component {
  componentWillMount = () => {
    const { fetchItem } = this.props.actions
    const { id } = this.props.match.params

    fetchItem('projects', id)
  }

  componentWillUnmount = () => {
    const { resetItem } = this.props.actions
    resetItem()
  }

  render() {
    const { actions, user } = this.props
    const { isAuthenticated } = user
    const {
      item,
      error,
      loading,
      saving,
      uploading
    } = this.props.item

    return (
      <div className='Project'>
        {loading
          ? <Loading />

          : isAuthenticated
            ? <ProjectEdit model='projects' />
            : <Item
                item={item}
                label='Project'
                labelLink
                model='projects'
              />
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  item: state.item,
  user: state.user
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(itemActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project)
