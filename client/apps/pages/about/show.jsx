import PropTypes from 'prop-types'
import React from 'react'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { Image } from '../../../components/image/image.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { Social } from '../../../components/social/social_list.jsx'

export const AboutShow = props => {
  const { settings: { about } } = props
  const cover_image = about.images[0]
  const { embed_codes } = about

  return (
    <LayoutColumn
      label='Info'
      className='AboutShow'
    >
      {cover_image &&
        <Image {...cover_image} />
      }

      <div
        className='about__description'
        dangerouslySetInnerHTML={{__html: about.description}}
      />

      <div className='about__social'>
        <Social social={about.social} />
      </div>

      {embed_codes &&
        <EmbedList embed_codes={embed_codes} />
      }

    </LayoutColumn>
  )
}

AboutShow.propTypes = {
  settings: PropTypes.object
}
