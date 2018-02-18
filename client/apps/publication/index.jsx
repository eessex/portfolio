import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as itemActions from '../../actions/item'
import { Item } from '../../components/item/index.jsx'
import { Loading } from '../../components/layout/components/loading.jsx'

class Publication extends Component {
  componentWillMount = () => {
    const { fetchItem } = this.props.actions
    const { id } = this.props.match.params

    fetchItem('publications', id)
  }

  componentWillUnmount = () => {
    const { resetItem } = this.props.actions
    resetItem()
  }

  render() {
    const { match, user } = this.props
    const { isAuthenticated } = user
    const { item, loading } = this.props.item

    const model = match.path.split('/')[1]
    const label = model === 'publications' ? 'Publications' : 'Releases'

    return (
      <div className='Publication'>
        {loading
          ? <Loading />
          : <Item
              item={item}
              label={label}
              labelLink
              model='publications'
              editing={isAuthenticated}
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
)(Publication)
