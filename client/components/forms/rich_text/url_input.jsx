import PropTypes from 'prop-types'
import React, { Component } from 'react'

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
      <form
        onSubmit={this.onSubmit}
        className='input--url'>
        <input
          placeholder={name}
          ref='url'
          defaultValue={url || ''} />
        <button>Save</button>
      </form>
    )
  }
}