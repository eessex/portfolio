import React from 'react'

export class ErrorBoundary extends React.Component {
  componentDidCatch (error, _errorInfo) {
    console.error(error)
  }

  render () {
    return this.props.children
  }
}
