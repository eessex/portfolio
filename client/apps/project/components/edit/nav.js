import React, { Component } from 'react'
import { PublishButton } from '../../../components/forms/publish_button.js' 

export class Nav extends Component {
  constructor(props) {
    super(props)

    this.onPublish = this.onPublish.bind(this)
    this.saveProject = this.saveProject.bind(this)
  }

  onPublish = () => {
    const newProject = this.props.event
    newProject.published = !newProject.published
    this.props.saveProject(newProject)
  }

  saveProject() {
    this.props.saveProject(this.props.event)
  }

  render() {
    const { needSave, isSaving, event } = this.props
    var need = needSave ? ' attention' : ''
    var saving = isSaving ? ' saving' : ''
    var save = null
    if (needSave) {
      save = styles.attention
    } else if (isSaving) {
      save = styles.saving
    }

    return (
      <nav>
        <button
          className='delete'
          onClick={this.props.deleteProject}>
          Delete
        </button>
        <button
          onClick={this.saveProject}
          className={need + saving}
          style={save}>
          Save
        </button>
        <PublishButton onClick={this.saveProject} published={project.published} />
      </nav>
    )
  }
}

const styles = {
  attention: {
    color: 'red'
  },
  saving: {
    color: 'limegreen'
  },
}