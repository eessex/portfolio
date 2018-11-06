import { connect } from 'react-redux'
import { stripTags, truncate } from 'underscore.string'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet'

import { ErrorBoundary } from 'client/components/ErrorBoundary'
import { NotFound } from 'client/components/NotFound'
import { Loading } from 'client/components/layout/components/loading'
import { Item as ViewItem } from 'client/components/item'
import * as itemActions from 'client/actions/item'

const prettyDescription = html => {
  return truncate(stripTags(html), 150)
}

const getMetaData = (meta, item = {}) => {
  const { description, title } = item

  const metaDescription = description ? prettyDescription(description) : meta.description
  return [
    { name: 'description', content: metaDescription },
    { property: 'og:title', content: title }
  ]
}

export class Item extends Component {
  static propTypes = {
    error: PropTypes.object,
    // fetchItemsAction: PropTypes.func,
    isAuthenticated: PropTypes.any,
    item: PropTypes.object,
    loading: PropTypes.bool,
    match: PropTypes.any,
    model: PropTypes.string,
    staticContext: PropTypes.any,
    settings: PropTypes.object
  }

  constructor (props) {
    super(props)

    let data
    let meta
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.data
      meta = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.settings
      delete window.__INITIAL_DATA__
    } else {
      data = props.staticContext.data
      meta = props.staticContext.settings
    }
    this.state = { data, meta, isEditing: false }
  }

  componentWillMount () {
    const { item, loading } = this.props

    if ((!item || item._id) && !loading) {
      this.fetchItem()
    }
  }

  componentDidMount () {
    if (this.props.isAuthenticated && __isBrowser__) {
      this.setState({ isEditing: true })
    }
  }

  componentWillUpdate (prevProps) {
    const { match: { path } } = this.props

    if (prevProps.match.path !== path) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    // const { fetchItemAction, match: { path }, model } = this.props
    // const formattedPath = path === '/releases' ? '/publications' : path
    // fetchItemAction(model, formattedPath)
  }

  getApp = (item, metaData) => {
    const { model } = this.props
    const { isEditing } = this.state
    const formattedLabel = model === 'publications' ? 'Release' : model

    switch (model) {
      default: {
        return (
          <React.Fragment>
            <Helmet
              title={item.title}
              meta={getMetaData(metaData, item)}
            />
            <ViewItem
              item={item}
              label={formattedLabel}
              labelLink
              model={model}
              editing={isEditing}
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

const mapStateToProps = ({ itemReducer, settingsReducer, user }) => ({
  error: itemReducer.error,
  item: itemReducer.item,
  loading: itemReducer.loading,
  settings: settingsReducer.settings,
  isAuthenticated: user.isAuthenticated
})

const mapDispatchToProps = ({
  fetchItemAction: itemActions.fetchItem
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
