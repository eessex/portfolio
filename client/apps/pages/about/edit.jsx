import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { ImageEdit } from '../../../components/image/image_edit.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { SocialEdit } from '../../../components/social/social_edit.jsx'

export class AboutEdit extends Component {
  static propTypes = {
    actions: PropTypes.object,
    settings: PropTypes.object,
    saving: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      isSaved: true,
      settings: props.settings
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

  render () {
    const { actions, saving } = this.props
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
            className='p'
          />

          <div className='about__social'>
            <SocialEdit social={settings.about.social} onChange={this.onChange} />
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
