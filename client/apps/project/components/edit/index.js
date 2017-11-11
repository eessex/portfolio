import React, { Component } from 'react'
import { PublishButton } from '../../../components/forms/publish_button.js'
import { SaveButton } from '../../../components/forms/buttons/save.js'
import { PlainText } from '../../../components/forms/rich_text/plain_text.js'
import RichText from '../../../components/forms/rich_text/index.js'
require('./index.scss')

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
    debugger
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
    const { updateProject } = this.props.actions
    return (
      <div className='ProjectEdit'>

        <nav>
          <PublishButton
            published={project.published}
            onClick={() => this.onChange('published', !project.published)}
          />
          <SaveButton
            isSaved={isSaved}
            isSaving={isSaving}
            onClick={() => this.maybeSaveProject(project, true)}
          />
        </nav>

        <PlainText
          content={project.title}
          placeholder='Project title'
          className='h1'
          onChange={(value) => this.onChange('title', value)}
        />
        <RichText
          html={project.description}
          placeholder='Description'
          onChange={(value) => this.onChange('description', value)}
        />
      </div>
    )
  }
}
