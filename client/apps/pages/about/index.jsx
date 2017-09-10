import React, { Component } from 'react'
import AboutSocial from './social.jsx'
import RichText from '../../components/forms/rich_text/index.js'

class About extends Component {
  constructor(props) {
    super(props)
  }

  onChange = (key, value) => {
    var newSettings = Object.assign({}, this.props.settings, {})
    newSettings.about[key] = value
    this.props.actions.updateSettings(newSettings)
  }

  renderDescriptionInput(settings) {
    return (
      <RichText
        onChange={this.onChange}
        html={settings.about.description}
        placeholder='Start typing a description ...' />
    )
  }
  renderDescription(settings) {
    return (
      <div
        className='about__description'
        dangerouslySetInnerHTML={{__html: settings.about.description}} />
    )
  }

  render() {
    const { settings, isAuthenticated } = this.props
    return (
      <div className='about__description'>
        {isAuthenticated
          ?
          this.renderDescriptionInput(settings)
          :
          this.renderDescription(settings)
        }
        <div className='about__social'>
          <AboutSocial social={settings.about.social} />
        </div>
      </div>
    )
  }
}

export default About