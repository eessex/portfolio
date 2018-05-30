import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { stripTags } from 'underscore.string'

export const ImageShow = (props) => {
  const { caption, url } = props
  const alt = stripTags(caption) || ''

  return (
    <div className='ImageShow'>
      <img
        src={url}
        alt={alt}
        width='100%'
      />
      {caption &&
        <Caption
          className='ImageShow__caption'
          dangerouslySetInnerHTML={{__html: caption}}
        />
      }
    </div>
  )
}

const Caption = styled.div`
  p {
    font-size: .7em;
    padding: 0;
    text-align: right;
    color: #ddd;
    margin-top: 5px;
  }
`

ImageShow.propTypes = {
  caption: PropTypes.string,
  url: PropTypes.string
}
