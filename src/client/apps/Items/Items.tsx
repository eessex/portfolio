import { connect } from 'react-redux'
import React, { Component } from 'react'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as itemsActions from 'client/actions/items'
import { Events } from './Components/Events'
import { Projects } from './Components/Projects'
import { Publications } from './Components/Publications'
import { Loading } from 'client/components/Loading'
import { Error, Model, Item } from 'client/typings'

interface ItemsProps {
  error: Error
  fetchItemsAction: (model: string, query: any) => void
  isAuthenticated: boolean
  items: Item[]
  title: string
  loading: boolean
  match: any
  model: Model
  staticContext: any
}

interface ItemsState {
  data: any
}

export class Items extends Component<ItemsProps, ItemsState> {
  constructor (props) {
    super(props)

    let data
    // @ts-ignore
    if (__isBrowser__) {
      // @ts-ignore
      data = window.__INITIAL_DATA__
      // @ts-ignore
      delete window.__INITIAL_DATA__
    } else {
      data = props.staticContext.data
    }
    this.state = { data }
  }

  componentWillMount () {
    const { items, loading } = this.props

    if ((!items || items.length === 0) && !loading) {
      this.fetchItems()
    }
  }

  componentWillUpdate (prevProps) {
    const { match: { path } } = this.props

    if (prevProps.match.path !== path) {
      this.fetchItems()
    }
  }

  fetchItems = () => {
    const {
      isAuthenticated,
      fetchItemsAction,
      match: { path }
    } = this.props
    const query = isAuthenticated ? {} : { published: true }
    const formattedPath = path === '/releases' ? '/publications' : path

    fetchItemsAction(formattedPath, query)
  }

  getApp = (items: Item[]) => {
    const { model, title } = this.props

    switch (model) {
      case 'events': {
        return <Events items={items} />
      }
      case 'projects': {
        return <Projects items={items} />
      }
      case 'publications':
      case 'releases': {
        return <Publications items={items} title={title} />
      }
      default: {
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
  }

  render () {
    const { data } = this.state
    const { error } = this.props
    const items = data && data || this.props.items

    if (!items || this.props.loading) {
      return <Loading />
    } else {
      return (
        <ErrorBoundary error={error}>
          {this.getApp(items)}
        </ErrorBoundary>
      )
    }
  }
}

const mapStateToProps = ({ itemsReducer, userReducer }) => ({
  error: itemsReducer.error,
  items: itemsReducer.list,
  loading: itemsReducer.loading,
  isAuthenticated: userReducer.isAuthenticated
})

const mapDispatchToProps = ({
  fetchItemsAction: itemsActions.fetchItems
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Items)
