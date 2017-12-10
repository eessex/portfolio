import PropTypes from 'prop-types'
import React from 'react'
import { ProjectHeader } from './header.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'


export const ProjectShow = (props) => {
    const { title, images, description } = props.project

    return (
      <LayoutColumn className='ProjectShow'>
        <ProjectHeader
          title={title}
          coverImage={images && images[0]}
          layout='centered'
        />
        {description &&
          <div
            className='ProjectShow__body'
            dangerouslySetInnerHTML={{__html: description}}
          />
        }
      </LayoutColumn>
    )
  }

ProjectShow.propTypes = {
  project: PropTypes.object
}
