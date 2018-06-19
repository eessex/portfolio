import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemsActions from 'client/actions/items'
import { sortByDate } from 'client/utils'
import { ItemsList } from 'client/components/items_list'
import { NewButton } from 'client/components/header/components/new_button'
import { Loading } from 'client/components/layout/components/loading'

class Events extends Component {
  static propTypes = {
    createItem: PropTypes.func,
    fetchItems: PropTypes.func,
    items: PropTypes.object,
    user: PropTypes.object
  }

  constructor (props) {
    super(props)

    const isAdmin = props.user.isAuthenticated
    const query = isAdmin ? {} : {published: true}

    this.state = {
      query,
      isAdmin
    }
  }

  componentWillMount () {
    const { fetchItems } = this.props
    const { query } = this.state

    fetchItems('events', query)
  }

  render () {
    const { createItem, items } = this.props
    const { isAdmin } = this.state
    const { list, loading } = items
    const upcoming = sortByDate(list, 'start_date').upcoming.reverse()
    const past = sortByDate(list, 'start_date').past

    return (
      <div>
        {loading
          ? <Loading />

          : (
            <div>
              {isAdmin &&
                <NewButton
                  model='Event'
                  onCreate={() => createItem('events')}
                />
              }
              {upcoming.length > 0 &&
                <ItemsList
                  label='Upcoming Events'
                  model='events'
                  layout='grid'
                  list={upcoming}
                />
              }
              {past.length > 0 &&
                <ItemsList
                  label='Past Events'
                  model='events'
                  list={past}
                  layout='table'
                  canToggle
                />
              }
            </div>
          )
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
)(Events)
