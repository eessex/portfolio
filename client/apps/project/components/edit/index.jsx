import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { EditNav } from '../../../components/forms/edit_nav.jsx'
import { PlainText } from '../../../components/forms/rich_text/plain_text.js'
import RichText from '../../../components/forms/rich_text/index.js'

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
    const { isSaving } = this.props
    const { updateProject, deleteProject } = this.props.actions

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
          <Col lg={7}>
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
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}