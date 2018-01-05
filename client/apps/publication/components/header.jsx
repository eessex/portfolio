import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { ShowFormats } from './show/show_formats.jsx'

export const PublicationHeader = (props) => {
    const { coverImage, publication, setEditing } = props
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
    const editArtist = () => setEditing('artist')
    const editTitle = () => setEditing('title')

    return (
      <div className='Publication__header' data-layout={layout}>
        {renderBlock
          ? <div className='h1'>
              <div
                onClick={setEditing && editArtist}
                data-placeholder={setEditing && !artist}
              >
                {artist ? artist : 'Add Artist'}
              </div>
              <div
                onClick={setEditing && editTitle}
                data-placeholder={setEditing && !title}
              >
                {title ? title : 'Add Title'}
              </div>
            </div>

            : <div className='h1'>
                <span
                  onClick={setEditing && editArtist}
                  data-placeholder={setEditing && !artist}
                >
                  {artist ? `${artist}: ` : 'Add Artist'}
                </span>
                <span
                  onClick={setEditing && editTitle}
                  data-placeholder={setEditing && !title}
                >
                  {title ? title : 'Add Title'}
                </span>
              </div>
        }
        {formats &&
          <ShowFormats
            items={formats}
            onClick={setEditing ? () => setEditing('formats') : undefined}
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
  publication: PropTypes.object,
  setEditing: PropTypes.func
}
