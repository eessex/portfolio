import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class ShowFormat extends Component {
  static propTypes = {
    item: PropTypes.object,
    short: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { item, short, onClick } = this.props
    const {
      compilation,
      format,
      publisher,
      release_year
    } = item
    const formattedFormat = (publisher || (release_year && !short)) ? `${format}, ` : format
    const formattedPublisher = release_year && !short ? `${publisher}, ` : publisher 

    return (
      <div className='ShowFormat' onClick={onClick}>
       {formattedFormat}
       {formattedPublisher}
       {!short && release_year}
      </div>
    )
  }
}
