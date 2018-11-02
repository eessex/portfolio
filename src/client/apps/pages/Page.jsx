import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as pageActions from 'client/actions/page'
import { Loading } from 'client/components/layout/components/loading'

import { Info } from './Info'

export class Page extends Component {
  static propTypes = {
    error: PropTypes.object,
    fetchPageAction: PropTypes.func,
    page: PropTypes.object,
    loading: PropTypes.bool,
    match: PropTypes.any,
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
    const { page, loading } = this.props

    if ((!page || page && !page._id) && !loading) {
      this.fetchPage()
    }
  }

  componentWillUpdate (prevProps) {
    const { match: { path } } = this.props

    if (prevProps.match.path !== path) {
      this.fetchPage()
    }
  }

  fetchPage = () => {
    const { fetchPageAction, match: { path } } = this.props

    fetchPageAction(path)
  }

  getApp = page => {
    switch (page) {
      default: {
        return (
          <Info page={page} />
        )
      }
    }
  }

  render () {
    const { data } = this.state
    const { error } = this.props
    const page = data && data || this.props.page

    if (!page || (page && !page._id) || this.props.loading) {
      return <Loading />
    } else {
      return (
        <ErrorBoundary error={error}>
          {this.getApp(page)}
        </ErrorBoundary>
      )
    }
  }
}

const mapStateToProps = ({ pageReducer }) => ({
  error: pageReducer.error,
  page: pageReducer.page,
  loading: pageReducer.loading
})

const mapDispatchToProps = ({
  fetchPageAction: pageActions.fetchPage
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Page)
