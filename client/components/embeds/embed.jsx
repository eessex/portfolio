import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const Embed = (props) => {
  const { embed_code } = props

  return (
    <EmbedContainer
      dangerouslySetInnerHTML={{__html: embed_code}}
    />
  )
}

Embed.propTypes = {
  embed_code: PropTypes.string
}

export const EmbedContainer = styled.div`
  iframe {
    width: 100%;
  }
`
