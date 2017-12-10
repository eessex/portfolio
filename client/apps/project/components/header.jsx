import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/images/image/image_show.jsx'

export const ProjectHeader = (props) => {
    const { title, coverImage, layout } = props

    return (
      <div className='ProjectHeader' data-layout={layout}>
        {coverImage && coverImage.url &&
          <ImageShow {...coverImage} />
        }
        <div className='h1'>
          {title}
        </div>
      </div>
    )
  }

ProjectHeader.propTypes = {
  title: PropTypes.string
}