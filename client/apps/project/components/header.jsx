import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/image/image_show.jsx'
import { Text } from '../../../components/text/text.jsx'

export const ProjectHeader = (props) => {
    const {
      title,
      coverImage,
      layout,
      setEditing
    } = props

    const { url } = coverImage || ''
    const editTitle = () => setEditing('title')

    return (
      <div className='ProjectHeader' data-layout={layout}>
        <Text
          className='h1 title'
          onClick={setEditing ? editTitle : undefined}
          placeholder='Add Title'
          text={title}
        />

        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

ProjectHeader.propTypes = {
  coverImage: PropTypes.object,
  layout: PropTypes.string,
  setEditing: PropTypes.func,
  title: PropTypes.string
}
