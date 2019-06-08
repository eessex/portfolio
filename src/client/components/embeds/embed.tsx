import styled from 'styled-components'
import React from 'react'

export const Embed: React.SFC<{ embed_code: string }> = (
  { embed_code }
) => {
  return (
    <EmbedContainer
      dangerouslySetInnerHTML={{__html: embed_code}}
    />
  )
}

export const EmbedContainer = styled.div`
  iframe {
    width: 100%;
  }
`
