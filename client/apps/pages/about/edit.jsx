import React, { Component } from 'react'
import { Social } from '../../../components/social/social_list.jsx'
import AdminSocial from './admin_social.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { ImageEdit } from '../../../components/image/image_edit.jsx'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'

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
      <ImagesEdit
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
      <EmbedModal
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
    const embed_codes = settings.about.embed_codes || []

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
          setEditing={(isEditing) => this.setState({ isEditing })}
          onClickImage={() => this.setState({isEditing: 'images'})}
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
        />

        <LayoutColumn
          label='Info'
        >
          {cover_image &&
            <ImageEdit
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

          <EmbedList
            embed_codes={embed_codes.length > 0 ? embed_codes : undefined}
          />

          {isEditing === 'images' && this.editImages()}
          {isEditing === 'embeds' && this.editEmbeds()}
        </LayoutColumn>
      </div>
    )
  }
}
