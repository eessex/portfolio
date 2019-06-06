import { connect } from 'react-redux'
import { stripTags, truncate } from 'underscore.string'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import * as url from 'url'

import { ErrorBoundary } from 'client/components/ErrorBoundary'
import { NotFound } from 'client/components/NotFound'
import { Loading } from 'client/components/Loading'
import { Item as ViewItem } from 'client/components/item'
import * as itemActions from 'client/actions/item'
import { Error, Settings, Meta, Model, Item as ItemType } from 'client/typings'

const { BASE_URL } = process.env

const prettyDescription = html => {
  return truncate(stripTags(html), 150)
}

const getMetaData = (meta, item: ItemType) => {
  const { description, title } = item

  const metaDescription = description ? prettyDescription(description) : meta.description
  return [
    { name: 'description', content: metaDescription },
    { property: 'og:title', content: title }
  ]
}

interface ItemProps {
  error: Error
  fetchItemAction: (model: string, param: string) => void
  isAuthenticated: boolean
  item: ItemType
  loading: boolean
  match: any
  model: Model
  staticContext: any
  settings: Settings
}

interface ItemState {
  data: any
  isEditing: boolean
  meta: Meta
}

export class Item extends Component<ItemProps, ItemState> {
  constructor (props) {
    super(props)

    let data
    let meta
    // @ts-ignore
    if (__isBrowser__) {
      // @ts-ignore
      data = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.data
      // @ts-ignore
      meta = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.settings
      // @ts-ignore
      delete window.__INITIAL_DATA__
    } else {
      data = props.staticContext.data
      meta = props.staticContext.settings
    }
    this.state = { data, meta, isEditing: false }
  }

  componentWillMount () {
    const { item, loading } = this.props

    if ((!item || !Object.keys(item).length) && !loading) {
      this.fetchItem()
    }
  }

  componentDidMount () {
    // @ts-ignore
    if (this.props.isAuthenticated && __isBrowser__) {
      this.setState({ isEditing: true })
    }
  }

  componentWillUpdate (prevProps) {
    const { item, loading, model } = this.props
    const prevSlug = url.parse(BASE_URL + prevProps.match.url).href.split('/').pop()

    if (model === 'pages' && prevSlug !== item.slug && !loading) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    const { item, fetchItemAction, match: { path }, model } = this.props
    let param = item._id
    let formattedModel = model === 'releases' ? '/publications' : `/${model}`

    if (model === 'pages') {
      formattedModel = '/pages'
      param = path.replace('/', '')
    }

    fetchItemAction(formattedModel, param)
  }

  getApp = (item, metaData) => {
    const { model } = this.props
    const { isEditing } = this.state
    const isPage = model === 'pages'
    const formattedLabel = model === 'publications' ? 'Release' : isPage ? 'Info' : model
    const socialLinks = metaData && metaData.social

    switch (model) {
      default: {
        return (
          <React.Fragment>
            <Helmet
              title={!isPage ? item.title : undefined}
              meta={getMetaData(metaData, item)}
            />
            <ViewItem
              item={item}
              label={formattedLabel}
              labelLink
              model={model}
              editing={isEditing}
              social={isPage ? socialLinks : undefined}
            />
          </React.Fragment>
        )
      }
    }
  }

  render () {
    const { data, meta } = this.state
    const { error } = this.props
    const item = data && data || this.props.item
    const metaData = meta && meta || this.props.settings

    if (!item || this.props.loading) {
      return <Loading />
    } if (error && error.message.includes('404')) {
      return <NotFound />
    } else {
      return (
        <ErrorBoundary error={error}>
          {this.getApp(item, metaData)}
        </ErrorBoundary>
      )
    }
  }
}

const mapStateToProps = ({ itemReducer, settingsReducer, userReducer }) => ({
  error: itemReducer.error,
  item: itemReducer.item,
  loading: itemReducer.loading,
  settings: settingsReducer.settings,
  isAuthenticated: userReducer.isAuthenticated
})

const mapDispatchToProps = ({
  fetchItemAction: itemActions.fetchItem
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
