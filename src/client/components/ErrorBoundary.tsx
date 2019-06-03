import React, { Component } from 'react'

export class ErrorBoundary extends Component<{children: any}> {
  componentDidCatch (error, _errorInfo) {
    console.error(error)
  }

  render () {
    return this.props.children
  }
}
