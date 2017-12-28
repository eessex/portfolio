import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EditImagesList } from '../../../components/forms/images/edit_images_list.jsx'
import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { FileInput } from '../../../components/forms/file_input/index.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { PlainText } from '../../../components/forms/rich_text/plain_text.jsx'
import { RichText } from '../../../components/forms/rich_text/index.jsx'

export class ProjectEdit extends Component {
  constructor (props) {
    super(props)

    this.state = {
      project: props.project,
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
    const { project, isSaved } = this.state
    const { actions, isSaving } = this.props
    const { fetchUpload, updateProject, deleteProject } = actions

    const images = project.images || []
    const links = project.links || []

    return (
      <div className='ProjectEdit Edit'>
        <EditNav 
          deleteitem={() => deleteProject(project)}
          isSaved={isSaved}
          isSaving={isSaving}
          item={project}
          model='projects'
          onPublish={() => this.onChange('published', !project.published)}
          saveItem={() => this.maybeSaveProject(project, true)}
        />
        <LayoutColumn
          className='Edit__body'
          label='Project'
          labelLink='/projects'
        >
          {images[0]
          ?
            <EditImagesList
              fetchUpload={fetchUpload}
              images={project.images}
              onChange={(value) => this.onChange('images', value)}
            />
          :
            <FileInput
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChange('images', [image])}
            />
          }
          <div className='ProjectEdit__body'>
            <PlainText
              content={project.title}
              placeholder='Project title'
              className='Project__title h1'
              onChange={(value) => this.onChange('title', value)}
            />
            <RichText
              html={project.description}
              placeholder='Description'
              className='Project__description'
              onChange={(value) => this.onChange('description', value)}
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
