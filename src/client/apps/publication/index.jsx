import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as itemActions from 'client/actions/item'
import { Item } from 'client/components/item'
import { Loading } from 'client/components/layout/components/loading'

class Publication extends Component {
  static propTypes = {
    fetchItem: PropTypes.func,
    item: PropTypes.object,
    isAuthenticated: PropTypes.bool,
    loading: PropTypes.bool,
    match: PropTypes.object,
    resetItem: PropTypes.func
  }

  componentWillMount = () => {
    const {
      fetchItem,
      match: { params: { id } }
    } = this.props

    fetchItem('publications', id)
  }

  componentWillUnmount = () => {
    this.props.resetItem()
  }

  render () {
    const {
      match: { path },
      item,
      isAuthenticated,
      loading
    } = this.props

    const model = path.split('/')[1]
    const label = model === 'publications' ? 'Publications' : 'Releases'

    return (
      <div>
        {loading
          ? <Loading />
          : (
            <Item
              item={item}
              label={label}
              labelLink
              model='publications'
              editing={isAuthenticated}
            />
          )
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  item: state.item.item,
  loading: state.item.loading,
  isAuthenticated: state.user.isAuthenticated
})

const mapDispatchToProps = {
  fetchItem: itemActions.fetchItem,
  resetItem: itemActions.resetItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Publication)
