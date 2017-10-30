import React, { Component } from 'react'

export default class ProjectShow extends Component {
  constructor(props) {
    super(props)
  }

  renderLinks(project) {
    if (project.links) {
      const listItems =  project.links.map( (link, i) =>
      <div className='project--show__link' key={i}>
        <a href={link.url} target='_blank'>
          {link.title ? link.title : link.url}
        </a>
      </div>
    )
    return <div className='project--show__links'>{listItems}</div>
    }
  }

  render() {
    const { project } = this.props
    return (
      <div className='project--show'>
        {project.images && project.images[0] ?
          <div className='project__image'><img src={project.images[0].url} /></div> : null
        }
        <div className='project__body container'>
          <div className='project__header'>
            <h1>{project.title}</h1>
          </div>
          <div
            className='project__description'
            dangerouslySetInnerHTML={{__html: project.description}} />
          {this.renderLinks(project)}
        </div>
      </div>
    )
  }
}
