import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EmbedModal } from '../../../components/embeds/embed_modal.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { ImagesEdit } from '../../../components/images/images_edit.jsx'
import { Item } from '../../../components/item/index.jsx'
import { LinksModal } from '../../../components/links/links_modal.jsx'
import { TextModal } from '../../../components/text/text_modal.jsx'


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

  render () {
    const { project, isEditing, isSaved } = this.state
    const { actions, isSaving } = this.props
    const { fetchUpload, updateProject, deleteProject } = actions

    const images = project.images || []
    const links = project.links || []
    const embed_codes = project.embed_codes || []

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
          onClickLink={() => this.setState({isEditing: 'links'})}
          onPublish={() => this.onChange('published', !project.published)}
          saveItem={() => this.maybeSaveProject(project, true)}
        />

        <Item
          item={project}
          label='Project'
          labelLink
          model='projects'
          onChange={this.onChange}
          setEditing={(isEditing) => this.setState({ isEditing })}
        />

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

        {isEditing === 'links' &&
          <LinksModal
            links={project.links}
            onChange={(value) => this.onChange('links', value)}
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
