import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../buttons/button.jsx'

export default class UrlInput extends Component {
  static propTypes = {
    confirmLink: PropTypes.func,
    name: PropTypes.string,
    url: PropTypes.string
  }

  onSubmit = e => {
    e.preventDefault()
    this.props.confirmLink(this.refs.url.value)
  }

  render () {
    const { name, url } = this.props

    return (
      <form onSubmit={this.onSubmit}>
        <input
          placeholder={name}
          ref='url'
          defaultValue={url || ''}
        />
        <Button>
          Save
        </Button>
      </form>
    )
  }
}
