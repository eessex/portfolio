import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class LinkForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      link: {
        title: props.title || '',
        url: props.url || ''
      }
    }
  }

  onChange = (key, value) => {
    const { index, onChange } = this.props
    const { link } = this.state

    link[key] = value
    this.setState({ link })

    if (index) {
      onChange(link, index)
    } else {
      onChange(link)
    }
  }

  render () {
    const { title, url } = this.state.link

    return (
      <div className='LinkForm'>
        <input
          placeholder='Title'
          defaultValue={title}
          onChange={(e) => this.onChange('title', e.target.value)}
        />
        <input
          placeholder='http://example.com'
          defaultValue={url}
          onChange={(e) => this.onChange('url', e.target.value)}
        />
      </div>
    )
  }
}

LinkForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number,
  title: PropTypes.string,
  url: PropTypes.string
}
