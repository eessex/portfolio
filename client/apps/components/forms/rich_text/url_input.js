import React, { Component } from 'react'

export default class UrlInput extends Component {
  constructor(props) {
    super(props)
  }

  onSubmit = (e) => {
    e.preventDefault()
  	this.props.confirmLink(this.refs.url.value)
  }

  render() {
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
