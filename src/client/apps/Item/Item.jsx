import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as itemActions from 'client/actions/item2'
import { Loading } from 'client/components/layout/components/loading'
import { Item as ViewItem } from 'client/components/item'

export class Item extends Component {
  static propTypes = {
    error: PropTypes.object,
    // fetchItemsAction: PropTypes.func,
    item: PropTypes.object,
    // title: PropTypes.string,
    loading: PropTypes.bool,
    match: PropTypes.any,
    model: PropTypes.string,
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
    const { item, loading } = this.props

    if ((!item || item._id) && !loading) {
      this.fetchItem()
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

  getApp = item => {
    const { model } = this.props
    const formattedLabel = model === 'publications' ? 'Release' : model

    switch (model) {
      default: {
        return (
          <ViewItem
            item={item}
            label={formattedLabel}
            labelLink
            model={model}
          />
        )
      }
    }
  }

  render () {
    const { data } = this.state
    const { error } = this.props
    const item = data && data || this.props.item

    if (!item || this.props.loading) {
      return <Loading />
    } else {
      return (
        <ErrorBoundary error={error}>
          {this.getApp(item)}
        </ErrorBoundary>
      )
    }
  }
}

const mapStateToProps = ({ itemReducer }) => ({
  error: itemReducer.error,
  item: itemReducer.item,
  loading: itemReducer.loading
})

const mapDispatchToProps = ({
  fetchItemAction: itemActions.fetchItem
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item)
