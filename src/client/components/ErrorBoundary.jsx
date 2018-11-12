import React from 'react'
import PropTypes from 'prop-types'

export class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.any
  }

  componentDidCatch (error, errorInfo) {
    console.error(error)
  }

  render () {
    return this.props.children
  }
}
