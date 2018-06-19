import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { EmbedList } from 'client/components/embeds/embed_list'
import { Image } from 'client/components/image/image'
import { LayoutColumn } from 'client/components/layout/column'
import { Social } from 'client/components/social/social_list'
import { P } from 'client/styles/text'

export const AboutShow = props => {
  const { settings: { about } } = props
  const { embed_codes, images } = about
  const cover_image = images && images[0]

  return (
    <LayoutColumn label='Info'>
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
