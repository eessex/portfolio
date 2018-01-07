import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/image/image_show.jsx'

export const ProjectHeader = (props) => {
    const { title, coverImage, layout } = props
    const { url } = coverImage || ''

    return (
      <div className='ProjectHeader' data-layout={layout}>
        <div className='h1'>
          {title}
        </div>
        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

ProjectHeader.propTypes = {
  coverImage: PropTypes.object,
  title: PropTypes.string
}
