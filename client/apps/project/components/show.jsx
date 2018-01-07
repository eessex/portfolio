import PropTypes from 'prop-types'
import React from 'react'
import { ProjectHeader } from './header.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { LinksList } from '../../../components/links/links_list.jsx'

export const ProjectShow = (props) => {
  const { project } = props
  const { description, images, links, title } = project

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
      <LinksList links={links || []} />
    </LayoutColumn>
  )
}

ProjectShow.propTypes = {
  project: PropTypes.object
}
