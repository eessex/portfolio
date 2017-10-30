import React, { Component } from 'react'

export default class EventImage extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { image } = this.props
    return (
      <div className='event-image'>
        <img
          src={image.url}
          alt={image.title || ''}
          width='100%' />
      </div>
    )
  }
}