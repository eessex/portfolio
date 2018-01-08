import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { Body } from '../../../components/layout/components/body.jsx'
import { ItemHeader } from '../../../components/layout/components/header.jsx'

import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { FormatsModal } from '../../../components/formats/formats_modal.jsx'
import { TextModal } from '../../../components/text/text_modal.jsx'

export class PublicationEdit extends Component {
  static propTypes = {
    actions: PropTypes.any,
    error: PropTypes.object,
    isSaving: PropTypes.bool,
    label: PropTypes.string,
    loading: PropTypes.bool,
    publication: PropTypes.object.isRequired,
    uploading: PropTypes.bool
  }

  state = {
    publication: this.props.publication,
    isEditing: null,
    isSaved: true
  }

  onChange = (key, value) => {
    const publication = this.state.publication
    publication[key] = value

    this.setState({ publication, isSaved: false })
    this.maybeSavePublication(publication, key === 'published')
  }

  setEditing = (isEditing) => {
    this.setState({ isEditing })
  }

  maybeSavePublication = (publication, forceSave) => {
    let isSaved = false

    if (forceSave || !publication.published) {
      this.props.actions.updatePublication(publication)
      isSaved = true
    }
    this.setState({publication, isSaved})
  }

  editBody = () => {
    const { publication } = this.state

    return (
      <Body
        body={publication.description}
        onChange={(value) => this.onChange('description', value)}
      />
    )
  }

  showHeader = () => {
    const { publication, isEditing } = this.state
    const { label } = this.props

    return (
      <ItemHeader
        item={publication}
        model='publications'
        setEditing={this.setEditing}
      />
    )
  }

  editFooter = () => {
    const { publication } = this.state

    return (
      <EditLinkList
        links={publication.links}
        onChange={(value) => this.onChange('links', value)}
      />
    )
  }

  render () {
    const { publication, isEditing, isSaved } = this.state
    const { actions, isSaving, label } = this.props
    const { fetchUpload, updatePublication, deletePublication } = actions
    const { artist, title } = publication

    const embed_codes = publication.embed_codes || []
    const formats = publication.formats || []
    const images = publication.images || []
    const links = publication.links || []

    return (
      <div className='PublicationEdit Edit'>
        <EditNav 
          deleteitem={() => deletePublication(publication)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={publication}
          model='publications'
          onPublish={() => this.onChange('published', !publication.published)}
          saveItem={() => this.maybeSavePublication(publication, true)}
          onClickImage={() => this.setEditing('images')}
          onClickEmbed={() => this.setEditing('embeds')}
        />

        <LayoutGrid
          body={this.editBody}
          coverImage={images.length > 0 && images[0]}
          header={this.showHeader}
          footer={this.editFooter}
          label={label.slice(0,-1)}
          labelLink={`/${label.toLowerCase()}`}
          media={embed_codes}
        />

        {isEditing === 'artist' &&
          <TextModal
            className='h1'
            label='Artist'
            text={artist}
            onChange={(value) => this.onChange('artist', value)}
            setEditing={(isEditing) => this.setEditing(isEditing)}
          />
        }

        {isEditing === 'title' &&
          <TextModal
            className='h1'
            label='Title'
            text={title}
            onChange={(value) => this.onChange('title', value)}
            setEditing={(isEditing) => this.setEditing(isEditing)}
          />
        }

        {isEditing === 'formats' &&
          <FormatsModal
            label='Formats'
            formats={formats}
            onChange={this.onChange}
            setEditing={(isEditing) => this.setEditing(isEditing)}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={publication}
            fetchUpload={fetchUpload}
            onChange={(value) => this.onChange('images', value)}
            setEditing={(isEditing) => this.setEditing(isEditing)}
          />
        }

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(isEditing) => this.setEditing(isEditing)}
          />
        }
      </div>
    )
  }
}
