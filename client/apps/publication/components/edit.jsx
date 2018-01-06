import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { PlainText } from '../../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { EditHeader } from './edit/edit_header.jsx'

import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'

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
      <RichText
        html={publication.description}
        placeholder='Description'
        className='Publication__description'
        onChange={(value) => this.onChange('description', value)}
      />
    )
  }

  showMedia = () => {
    const embed_codes = this.state.publication.embed_codes || []

    return <EmbedList embed_codes={embed_codes} />
  }

  editHeader = () => {
    const { publication, isEditing } = this.state
    const { label } = this.props

    return (
      <EditHeader
        isEditing={isEditing}
        publication={publication}
        label={label}
        onChange={this.onChange}
        className='Publication__header'
        setEditing={(editing) => this.setState({isEditing: editing})}
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

  editImages = () => {
    const { publication } = this.state
    const { actions } = this.props

    return (
      <ImagesEdit
        item={publication}
        fetchUpload={actions.fetchUpload}
        onChange={(value) => this.onChange('images', value)}
        setEditing={(editing) => this.setState({isEditing: editing})}
      />
    )
  }

  showCoverImage = () => {
    const { publication } = this.props
    const images = publication.images || []

    if (images.length) {
      const image = images[0]
      return (
        <ImageShow {...image} />
      )
    }
  }

  render () {
    const { publication, isEditing, isSaved } = this.state
    const { actions, isSaving, label } = this.props
    const { fetchUpload, updatePublication, deletePublication } = actions

    const links = publication.links || []
    const embed_codes = publication.embed_codes || []

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
          onClickImage={() => this.setState({isEditing: 'images'})}
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
        />

        <LayoutGrid
          body={this.editBody}
          coverImage={this.showCoverImage}
          header={this.editHeader}
          footer={this.editFooter}
          label={label.slice(0,-1)}
          labelLink={`/${label.toLowerCase()}`}
          media={this.showMedia}
        />

        {isEditing === 'images' && this.editImages()}

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(editing) => this.setState({isEditing: editing})}
          />
        }
      </div>
    )
  }
}
