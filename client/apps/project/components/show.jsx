import PropTypes from 'prop-types'
import React from 'react'
import { ProjectHeader } from './header.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'

export const ProjectShow = (props) => {
  const { project } = props || {}
  const { title, images, description } = project

  return (
    <LayoutColumn
      className='ProjectShow'
      label='Project'
      labelLink='/projects'
    >
      <ProjectHeader
        title={title}
        coverImage={images && images[0]}
      />
      {description &&
        <div
          className='ProjectShow__body'
          dangerouslySetInnerHTML={{__html: description}}
        />
      }
      {renderLinks(project)}
    </LayoutColumn>
  )
}

ProjectShow.propTypes = {
  project: PropTypes.object
}

const renderLinks = (item) => {
  const { links } = item

  if (links && links.length) {
    return (
      <div className='LinksList'>
        {links.map( (link, i) =>
          <div className='LinksList__item' key={i}>
            <a href={link.url} target='_blank'>
              {link.title ? link.title : link.url}
            </a>
          </div>
        )}
      </div>
    )
  }
}
