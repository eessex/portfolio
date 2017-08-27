import React, { Component } from 'react'
import TextInput from '../../../../components/forms/text_input.js'

export default class EditLink extends Component {
  constructor(props) {
    super(props)
  }

  render() {
  	const { link, index } = this.props
    return (
      <div className='edit-link'>
        <TextInput
          name='link-title'
          value={link.title}
          index={index}
          onChange={this.props.onChange} />
        <TextInput
          name='link-url'
          value={link.url}
          index={index}
          onChange={this.props.onChange} />
      </div>
    )
  }
}
