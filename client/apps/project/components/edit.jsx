import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'

import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { TextModal } from '../../../components/text/text_modal.jsx'

import { Body } from '../../../components/layout/components/body.jsx'
import { ItemHeader } from '../../../components/layout/components/header.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { imageIsVertical } from '../../../utils/index.js'

export class ProjectEdit extends Component {
  constructor (props) {
    super(props)

    this.state = {
      project: props.project,
      isEditing: null,
      isSaved: true
    }
  }

  onChange = (key, value) => {
    const project = this.state.project
    project[key] = value

    this.setState({ project, isSaved: false })
    this.maybeSaveProject(project, key === 'published')
  }

  maybeSaveProject = (project, forceSave) => {
    let isSaved = false

    if (forceSave || !project.published) {
      this.props.actions.updateProject(project)
      isSaved = true
    }
    this.setState({project, isSaved})
  }

  renderHeader = (isGrid) => {
    const { project } = this.state
    const images = project.images || []
    const coverImage = !isGrid && images.length > 0 ? images[0] : undefined

    return (
      <ItemHeader
        coverImage={coverImage}
        item={project}
        model='projects'
        setEditing={(isEditing) => this.setState({ isEditing })}
      />
    )
  }

  renderBody = () => {
    const { project } = this.state

    return (
      <Body
        body={project.description}
        onChange={(value) => this.onChange('description', value)}
      />
    )
  }

  renderMedia = () => {
    const { project } = this.state
    const embed_codes = project.embed_codes || []

    return (
      <EmbedList embed_codes={embed_codes} />
    )
  }

  render () {
    const { project, isEditing, isSaved } = this.state
    const { actions, isSaving } = this.props
    const { fetchUpload, updateProject, deleteProject } = actions

    const images = project.images || []
    const links = project.links || []
    const embed_codes = project.embed_codes || []

    const isGrid = images.length > 0 && imageIsVertical(images[0])

    return (
      <div className='ProjectEdit Edit'>
        <EditNav 
          deleteitem={() => deleteProject(project)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={project}
          model='projects'
          onClickEmbed={() => this.setState({isEditing: 'embeds'})}
          onClickImage={() => this.setState({isEditing: 'images'})}
          onPublish={() => this.onChange('published', !project.published)}
          saveItem={() => this.maybeSaveProject(project, true)}
        />

        <LayoutColumn
          body={this.renderBody}
          className='Edit__body'
          header={() => this.renderHeader(isGrid)}
          label='Project'
          labelLink='/projects'
        >
          <div className='ProjectEdit__body'>
            <EditLinkList
              links={links}
              onChange={(value) => this.onChange('links', value)}
            />
          </div>
        </LayoutColumn>

        {isEditing === 'embeds' &&
          <EmbedModal
            embed_codes={embed_codes}
            onChange={(value) => this.onChange('embed_codes', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'images' &&
          <ImagesEdit
            item={project}
            fetchUpload={fetchUpload}
            onChange={(value) => this.onChange('images', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }

        {isEditing === 'title' &&
          <TextModal
            className='h1'
            label='Title'
            text={project.title}
            onChange={(value) => this.onChange('title', value)}
            setEditing={(isEditing) => this.setState({ isEditing })}
          />
        }
      </div>
    )
  }
}
