import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { EditImagesList } from '../../../components/forms/images/edit_images_list.jsx'
import { EditLinkList } from '../../../components/forms/links/edit_link_list.jsx'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { FileInput } from '../../../components/forms/file_input/index.jsx'
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

        <Row className='Edit__body'>
          {images[0]
          ?
            <Col xs={12} lg={4}>
              <EditImagesList
                fetchUpload={fetchUpload}
                images={project.images}
                onChange={(value) => this.onChange('images', value)}
              />
            </Col>
          :
            <FileInput
              fetchUpload={fetchUpload}
              onChange={(image) => this.onChange('images', [image])}
            />
          }

          <Col xs={12} lg={7}>
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
          </Col>
        </Row>
      </div>
    )
  }
}
