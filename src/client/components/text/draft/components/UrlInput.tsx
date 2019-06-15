import React, { Component } from 'react'
import { Button } from 'client/components/Button'

interface UrlInputProps {
  confirmLink: (val: string) => void
  name?: string
  url: string
}

export class UrlInput extends Component<UrlInputProps> {
  private url

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
