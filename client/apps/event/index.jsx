import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { Item } from '../../components/item/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

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

    return (
      <EventContainer>
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
      </EventContainer>
    )
  }
}

const EventContainer = styled.div`
  .Venue {
    margin: 1em 0;
  }
`

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
