import PropTypes from 'prop-types'
import React from 'react'
import { ImageShow } from '../../../components/image/image_show.jsx'
import { Text } from '../../../components/text/text.jsx'
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

        <Text
          className='h1 artist'
          onClick={setEditing ? editArtist : undefined}
          placeholder='Add Artist'
          text={artist}
        />
        <Text
          className='h1 title'
          onClick={setEditing ? editTitle : undefined}
          placeholder='Add Title'
          text={title}
        />

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
