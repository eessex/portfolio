import { connect } from 'react-redux'
import React, { Component } from 'react'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import * as pageActions from 'client/actions/page'
import { Loading } from 'client/components/Loading'
import { Home } from 'client/apps/Page/Components/Home'
import { Error, Item } from 'client/typings'

interface PageProps {
  error: Error
  fetchPageAction: (path: string) => void
  page: Item
  loading: boolean
  match: any
  staticContext: any
}

interface PageState {
  data: any
}

export class Page extends Component<PageProps, PageState> {
  constructor (props) {
    super(props)

    let data
    // @ts-ignore
    if (__isBrowser__) {
      data = (window as any).__INITIAL_DATA__
      delete (window as any).__INITIAL_DATA__
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

  getApp = (page) => {
    const { match: { path } } = this.props

    switch (path) {
      default: {
        return (
          <Home page={page} />
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
