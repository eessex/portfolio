import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { Item } from '../../components/item/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

class Publication extends Component {
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

  render() {
    const {
      match: { path },
      item: { item, loading },
      user
    } = this.props

    const model = path.split('/')[1]
    const label = model === 'publications' ? 'Publications' : 'Releases'
    const editing = user ? user.isAuthenticated : false

    return (
      <div className='Publication'>
        {loading
          ? <Loading />
          : <Item
              item={item}
              label={label}
              labelLink
              model='publications'
              editing={editing}
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

const mapDispatchToProps = {
  fetchItem: itemActions.fetchItem,
  resetItem: itemActions.resetItem
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Publication)
