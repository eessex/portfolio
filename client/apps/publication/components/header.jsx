import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/image/image_show.jsx'
import { Title } from '../../../components/layout/components/title.jsx'
import { ShowFormats } from '../../../components/formats/show_formats.jsx'

export const PublicationHeader = (props) => {
    const {
      coverImage,
      publication,
      setEditing
    } = props

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

        <Title title={artist} onClick={setEditing ? editArtist : undefined} />
        <Title title={title} onClick={setEditing ? editTitle : undefined} />

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
