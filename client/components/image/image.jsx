import { stripTags } from 'underscore.string'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const Image = props => {
  const { editCaption, caption, url } = props
  const alt = stripTags(caption) || ''

  return (
    <div className='Image'>
      <img
        src={url}
        alt={alt}
        width='100%'
      />
      {editCaption &&
        <Caption>{editCaption}</Caption>
      }
      {caption && (
        <Caption
          className='Image__caption'
          dangerouslySetInnerHTML={{__html: caption}}
        />
      )}
    </div>
  )
}

const Caption = styled.div`
  p,
  .public-DraftStyleDefault-block  {
    font-size: .7em;
    padding: 0;
    text-align: right;
    color: #ddd;
    margin-top: 5px;
  }
`

Image.propTypes = {
  editCaption: PropTypes.any,
  caption: PropTypes.string,
  url: PropTypes.string
}
