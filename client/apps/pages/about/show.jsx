import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { Image } from '../../../components/image/image.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { Social } from '../../../components/social/social_list.jsx'
import { P } from '../../../styles/text.jsx'

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

      <P dangerouslySetInnerHTML={{__html: about.description}} />

      <SocialContainer>
        <Social social={about.social} />
      </SocialContainer>

      {embed_codes &&
        <EmbedList embed_codes={embed_codes} />
      }

    </LayoutColumn>
  )
}

export const SocialContainer = styled.div`
  font-size: 90%;
  padding: 1em 0 4em;
`

AboutShow.propTypes = {
  settings: PropTypes.object
}
