import PropTypes from 'prop-types'
import React from 'react'
import { Item } from '../../../components/item/index.jsx'

export const ProjectShow = (props) => {
  const { project } = props
  const { description, images, links, title } = project

  return (
    <Item
      item={project}
      label='Project'
      labelLink
      model='projects'
    />
  )
}

ProjectShow.propTypes = {
  project: PropTypes.object
}
