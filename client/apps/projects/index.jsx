import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemsActions from '../../actions/items'
import { ItemsList } from '../../components/items_list/index.jsx'
import { NewButton } from '../../components/header/components/new_button.jsx'
import { LayoutColumn } from '../../components/layout/column.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

class Projects extends Component {
  static propTypes = {
    createItem: PropTypes.func,
    fetchItems: PropTypes.func,
    items: PropTypes.object,
    user: PropTypes.object
  }

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
    const { fetchItems } = this.props
    const { query } = this.state

    fetchItems('projects', query)
  }

  render() {
    const { createItem, items } = this.props
    const { isAdmin } = this.state
    const { loading } = items
    const { list } = items

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
                  onCreate={() => createItem('projects')}
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
  items: state.items,
  user: state.user
})

const mapDispatchToProps = {
  createItem: itemsActions.createItem,
  fetchItems: itemsActions.fetchItems
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Projects)
