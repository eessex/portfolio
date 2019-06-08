import { stripTags } from 'underscore.string'
import styled from 'styled-components'
import React from 'react'
import { Image as ImageType } from 'client/typings'

interface ImageProps extends ImageType {
  editCaption?: React.ReactNode
  onClick?: () => void
}

export const Image: React.SFC<ImageProps> = props => {
  const { editCaption, caption, url, onClick } = props
  const alt = stripTags(caption) || ''

  return (
    <ImageContainer onClick={onClick}>
      <img
        src={url}
        alt={alt}
        title={alt}
        width='100%'
      />
      {editCaption &&
        <Caption>{editCaption}</Caption>
      }
      {caption && (
        <Caption
          dangerouslySetInnerHTML={{__html: caption}}
        />
      )}
    </ImageContainer>
  )
}

export const Caption = styled.div`
  margin-top: 5px;
  p,
  .public-DraftStyleDefault-block,
  .public-DraftEditorPlaceholder-root  {
    margin: 0;
    font-size: .7em;
    padding: 0;
    text-align: right;
    color: ${({ theme }) => theme.colors.gray};
  }
`

export const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 1em;
  button {
    z-index: 1;
    position: absolute;
    right: -5px;
    top: -5px;
    padding: 4px 8px;
    &:hover {
      color: red;
    }
  }
`
