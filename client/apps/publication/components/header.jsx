import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { ShowFormats } from './show/show_formats.jsx'

export const PublicationHeader = (props) => {
    const { coverImage, publication } = props
    const {
      artist,
      formats,
      title,
      layout,
      release_date,
      publisher
    } = publication
    const { url } = coverImage || ''
    const renderBlock = (artist && artist.length > 30) || (title && title.length > 30)

    return (
      <div className='Publication__header' data-layout={layout}>
        {renderBlock
          ? <div className='h1'>
              <div>{artist && artist}</div>
              <div>{title}</div>
            </div>
          : <div className='h1'>
              {artist && `${artist}: `}{title}
            </div>
        }
        {formats &&
          <ShowFormats
            items={formats}
            onClick={() => this.setState({isEditing: 'formats'})}
          />
        }
        {coverImage && url &&
          <ImageShow {...coverImage} />
        }
      </div>
    )
  }

PublicationHeader.propTypes = {
  coverImage: PropTypes.object,
  title: PropTypes.string
}