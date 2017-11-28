import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ImageShow } from '../../../components/images/image/image_show.jsx'

export default class ProjectShow extends Component {
  renderLinks(project) {
    if (project.links) {
      return (
        <div className='ProjectShow__links'>
          {project.links.map( (link, i) =>
            <div className='link-item' key={i}>
              <a href={link.url} target='_blank'>
                {link.title ? link.title : link.url}
              </a>
            </div>
          )}
        </div>
      )
    }
  }

  render() {
    const { project } = this.props
    const image = project.images && project.images[0]

    return (
      <div className='project--show'>
        {image &&
          <ImageShow url={image.url} />
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

ProjectShow.propTypes = {
  project: PropTypes.object
}
