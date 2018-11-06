import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from 'client/actions/item'
import { Item } from 'client/components/item'
import { Loading } from 'client/components/layout/components/loading'
import { NotFound } from 'client/components/NotFound'

class Event extends Component {
  static propTypes = {
    fetchItem: PropTypes.func,
    item: PropTypes.shape({
      item: PropTypes.object,
      loading: PropTypes.bool
    }),
    match: PropTypes.any,
    resetItem: PropTypes.func,
    user: PropTypes.shape({
      isAuthenticated: PropTypes.bool
    })
  }

  componentWillMount = () => {
    const { fetchItem, match } = this.props
    const { id } = match.params

    fetchItem('events', id)
  }

  componentWillUnmount = () => {
    const { resetItem } = this.props
    resetItem()
  }

  render () {
    const { user } = this.props
    const { isAuthenticated } = user
    const { item, loading } = this.props.item

    if (!loading && !item._id) {
      return <NotFound />
    } else {
      return (
        <div>
          {loading
            ? <Loading />
            : (
              <Item
                item={item}
                label='Event'
                labelLink
                model='events'
                editing={isAuthenticated}
              />
            )
          }
        </div>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  item: state.item,
  user: state.user
})

const mapDispatchToProps = {
  fetchItem: itemActions.fetchItem,
  resetItem: itemActions.resetItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Event)
