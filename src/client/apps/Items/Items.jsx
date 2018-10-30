import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import { ItemsList } from 'client/Components/Items/ItemsList'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as itemsActions from 'client/actions/items2'
import { Events } from '../events'
import { Loading } from 'client/components/layout/components/loading'

export class Items extends Component {
  static propTypes = {
    // error: PropTypes.func,
    fetchItemsAction: PropTypes.func,
    items: PropTypes.array,
    loading: PropTypes.bool,
    staticContext: PropTypes.any
  }

  constructor (props) {
    super(props)

    let data
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__
      delete window.__INITIAL_DATA__
    } else {
      data = props.staticContext.data
    }
    this.state = { data }
  }

  componentWillMount () {
    const { items, loading } = this.props

    if (!items && !loading) {
      this.fetchItems()
    }
  }

  componentWillUpdate (prevProps) {
    const { path } = this.props.match

    if (prevProps.match.path !== path) {
      this.fetchItems()
    }
  }

  fetchItems = () => {
    const { fetchItemsAction, match: { path } } = this.props

    fetchItemsAction(path)
  }

  getApp = items => {
    const { model } = this.props

    switch (model) {
      case 'events':
        return <Events items={items} />
      default:
        return (
          <ul>
            {items.map(item => (
              <li key={item._id}>
                {item.title}
              </li>
            ))
            }
          </ul>
        )
    }
  }

  render () {
    const { data } = this.state
    const items = data && data || this.props.items

    if (!items || this.props.loading) {
      return <Loading />
    } else {
      return (
        <ErrorBoundary>
          {this.getApp(items)}
        </ErrorBoundary>
      )
    }
  }
}

const mapStateToProps = ({ itemsReducer }) => ({
  error: itemsReducer.error,
  items: itemsReducer.list,
  loading: itemsReducer.loading
})

const mapDispatchToProps = ({
  fetchItemsAction: itemsActions.fetchItems
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Items)
