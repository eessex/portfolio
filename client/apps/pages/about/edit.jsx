import React, { Component } from 'react'
import { Social } from '../../../components/social/social_list.jsx'
import AdminSocial from './admin_social.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { EditEmbeds } from '../../publication/components/edit/edit_embeds.jsx'
import { EditImages } from '../../publication/components/edit/edit_images.jsx'
import { EditImage } from '../../publication/components/edit/edit_image.jsx'

export class AboutEdit extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isSaved: true,
      settings: this.props.settings
    }
  }

  onSave = () => {
    const { settings } = this.state
    const { updateSettings } = this.props.actions

    updateSettings(settings)
    this.setState({isSaved: true})
  }

  onChange = (key, value) => {
    var newSettings = Object.assign({}, this.props.settings, {})
    newSettings.about[key] = value

    this.setState({
      isSaved: false,
      settings: newSettings
    })
  }

  onChangeImage = (image, index) => {
    const { settings } = this.state
    let newImages = settings.about.images

    newImages[index] = image
    this.onChange('images', newImages)
  }

  editImages = () => {
    const { about } = this.state.settings
    const { actions } = this.props

    return (
      <EditImages
        item={about}
        fetchUpload={actions.fetchUpload}
        onChange={(value) => this.onChange('images', value)}
        setEditing={(editing) => this.setState({isEditing: editing})}
      />
    )
  }

  editEmbeds = () => {
    const { about } = this.state.settings

    return (
      <EditEmbeds
        embed_codes={about.embed_codes || []}
        onChange={(value) => this.onChange('embed_codes', value)}
        setEditing={(editing) => this.setState({isEditing: editing})}
      />
    )
  }

  render() {
    const { actions, saving, isAuthenticated } = this.props
    const { isSaved, isEditing, settings } = this.state
    const cover_image = settings.about.images[0]

    return (
      <div
        className='AboutEdit'
      >
        <EditNav 
          isSaved={isSaved}
          isSaving={saving}
          item={settings.about}
          model='settings'
          saveItem={this.onSave}
          onClickImage={() => this.setState({isEditing: 'images'})}
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
        />

        <LayoutColumn
          label='Info'
        >
          {cover_image &&
            <EditImage
              className='AboutEdit__cover-image'
              fetchUpload={actions.fetchUpload}
              index={0}
              item={cover_image}
              onChange={(img) => this.onChangeImage(img, 0)}
              editCaption
            />
          }

          <RichText
            onChange={(value) => this.onChange('description', value)}
            html={settings.about.description}
            placeholder='Start typing ...'
          />

          <div className='about__social'>
            <AdminSocial social={settings.about.social} onChange={this.onChange} />
          </div>

          {isEditing === 'images' && this.editImages()}
          {isEditing === 'embeds' && this.editEmbeds()}
        </LayoutColumn>
      </div>
    )
  }
}
