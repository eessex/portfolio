import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'client/components/Button'

export class UrlInput extends Component {
  static url
  static propTypes = {
    confirmLink: PropTypes.func,
    name: PropTypes.string,
    url: PropTypes.string
  }

  onSubmit = e => {
    e.preventDefault()
    this.props.confirmLink(this.url.value)
  }

  render () {
    const { name, url } = this.props

    return (
      <form onSubmit={this.onSubmit}>
        <input
          placeholder={name}
          ref={ref => {
            this.url = ref
          }}
          defaultValue={url || ''}
        />
        <Button text='save' />
      </form>
    )
  }
}
