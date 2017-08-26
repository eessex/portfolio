import React, { Component } from 'react';
import TextInput from '../../../../components/forms/text_input.js';

export default class EditLink extends Component {
  constructor(props) {
    super(props);
  }

  render() {
  	const { link } = this.props
    return (
      <div className='event--edit__link-edit'>
        <TextInput
          name='link-title'
          value={link.title}
          onChange={this.props.onChangeLink} />
        <TextInput
          name='link-url'
          value={link.url}
          onChange={this.props.onChangeLink} />
      </div>
    )
  }
}
// {this.renderLinkSave(index || 'new-link')}