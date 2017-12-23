import React, { Component } from 'react'
import { Social } from '../../../components/social/social_list.jsx'
import AdminSocial from './admin_social.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { ImageShow } from '../../../components/images/image/image_show.jsx'

export default class About extends Component {
  onChange = (key, value) => {
    var newSettings = Object.assign({}, this.props.settings, {})
    newSettings.about[key] = value
    this.props.actions.updateSettings(newSettings)
  }

  render() {
    const { settings, isAuthenticated } = this.props
    const { cover_image } = settings

    return (
      <LayoutColumn
        label='Info'
        className='about__description'
      >
        {cover_image &&
          <ImageShow {...cover_image} />
        }
        {isAuthenticated
          ? <RichText
              onChange={this.onChange}
              html={settings.about.description}
              placeholder='Start typing a description ...'
            />
          : <div
              className='about__description'
              dangerouslySetInnerHTML={{__html: settings.about.description}}
            />
        }
        <div className='about__social'>
          { isAuthenticated
            ? <AdminSocial social={settings.about.social} onChange={this.onChange} />
            : <Social social={settings.about.social} />
          }
        </div>
      </LayoutColumn>
    )
  }
}
