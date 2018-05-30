import React, { Component } from 'react';
import { TextInput } from '../../../../components/forms/text_input.js'
require('./index.scss')

class SettingsInfo extends Component {
  state = {
    settings: {
      title: this.props.settings.title || '',
      description: this.props.settings.description || ''
    }
  }

  onChange = (key, value) => {
    var newSettings = Object.assign({}, this.props.settings, this.state.settings);
    newSettings[key] = value
    this.props.actions.updateSettings(newSettings)
    this.setState({settings: newSettings})
  }

  render () {
    const { settings } = this.state
    return (
      <div className='settings--site-description'>
        <TextInput
          label='Site Title'
          name='title'
          value={settings ? settings.title : this.props.settings.title}
          onChange={this.onChange} />
        <TextInput
          label='Site Description'
          name='description'
          placeholder='Appears in search results. Limited to 200 characters.'
          textarea
          value={settings ? settings.description : this.props.settings.description}
          onChange={this.onChange} />
      </div>
    );
  }
}

export default SettingsInfo
