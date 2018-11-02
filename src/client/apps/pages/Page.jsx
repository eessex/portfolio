import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as pageActions from 'client/actions/page'
// import { Events } from '../events/Events'
// import { Projects } from '../projects/Projects'
// import { Publications } from '../publications/Publications'
// import { Loading } from 'client/components/layout/components/loading'

import { Info } from './Info'

export class Page extends Component {
  static propTypes = {
    error: PropTypes.object,
    fetchPageAction: PropTypes.func,
    page: PropTypes.object,
    title: PropTypes.string,
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
    const { page, loading } = this.props

    if ((!page || page && !page._id) && !loading) {
      this.fetchPage()
    }
  }

  componentWillUpdate (prevProps) {
    // const { match: { path } } = this.props

    // if (prevProps.match.path !== path) {
    //   this.fetchItems()
    // }
  }

  fetchPage = () => {
    const { fetchPageAction, match: { path } } = this.props
    console.log('fetchPageAction', path)
    fetchPageAction(path)
  }

  getApp = () => {
    // const { model, title } = this.props

    // switch (model) {
    // case 'events': {
    //   return <Events items={items} />
    // }
    // case 'projects': {
    //   return <Projects items={items} />
    // }
    // case 'publications':
    // case 'releases': {
    //   return <Publications items={items} title={title} />
    // }
    // default: {
    return (
      <Info />
    )
    // }
    // }
  }

  render () {
    // const { data } = this.state
    const { error } = this.props
    // const items = data && data || this.props.items

    // if (!items || this.props.loading) {
    //   return <Loading />
    // } else {
    return (
      <ErrorBoundary error={error}>
        {this.getApp()}
      </ErrorBoundary>
    )
    // }
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
