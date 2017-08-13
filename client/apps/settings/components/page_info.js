import React, { Component } from 'react';
import TextInput from '../../components/forms/text_input.js'

class SettingsInfo extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);

    this.state = {
      settings: {
        title: this.props.settings.title || '',
        description: this.props.settings.description || ''
      }
    }
  }

  onChange(key, value) {
    var newSettings = Object.assign({}, this.props.settings, this.state.settings);
    newSettings[key] = value
    this.props.actions.updateSettings(newSettings)
    this.setState({settings: newSettings})
  }

  render() {
    const { settings } = this.state;
    return (
      <div className='settings--info'>
        <TextInput
          label='Page Title'
          name='title'
          value={settings ? settings.title : this.props.settings.title}
          onChange={this.onChange} />
        <TextInput
          label='Search Description'
          name='description'
          textarea={true}
          value={settings ? settings.description : this.props.settings.description}
          onChange={this.onChange} />
      </div>
    );
  }
}

export default SettingsInfo;
