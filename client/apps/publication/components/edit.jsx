import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EditImagesList } from '../../../components/forms/images/edit_images_list.jsx'
import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { FileInput } from '../../../components/forms/file_input/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { PlainText } from '../../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'

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

  render () {
    const { publication, isSaved } = this.state
    const { actions, isSaving, label } = this.props
    const { fetchUpload, updatePublication, deletePublication } = actions

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
        />
        <LayoutColumn
          className='Edit__body'
          label={label}
          labelLink={`/${label}`}
        >
          {images[0]
          ?
            <EditImagesList
              fetchUpload={fetchUpload}
              images={publication.images}
              onChange={(value) => this.onChange('images', value)}
            />
          :
            <FileInput
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChange('images', [image])}
            />
          }
          <div className='PublicationEdit__body'>
            <PlainText
              content={publication.artist}
              placeholder='Artist'
              className='Publication__artist h1'
              onChange={(value) => this.onChange('artist', value)}
            />
            <PlainText
              content={publication.title}
              placeholder='Publication title'
              className='Publication__title h1'
              onChange={(value) => this.onChange('title', value)}
            />
            <PlainText
              content={publication.publisher}
              placeholder='Publisher/Label'
              className='Publication__publisher p'
              onChange={(value) => this.onChange('publisher', value)}
            />
            <PlainText
              content={publication.format}
              placeholder='Format'
              className='Publication__format p'
              onChange={(value) => this.onChange('format', value)}
            />
            <PlainText
              content={publication.release_date}
              placeholder='Release Year'
              className='Publication__release-date p'
              onChange={(value) => this.onChange('release_date', value)}
            />
            <RichText
              html={publication.description}
              placeholder='Description'
              className='Publication__description'
              onChange={(value) => this.onChange('description', value)}
            />
            <PlainText
              content={publication.embed_url}
              placeholder='Embed URL'
              className='Publication__embed p'
              onChange={(value) => this.onChange('embed_url', value)}
            />
            <EditLinkList
              links={links}
              onChange={(value) => this.onChange('links', value)}
            />
          </div>
        </LayoutColumn>
      </div>
    )
  }
}
