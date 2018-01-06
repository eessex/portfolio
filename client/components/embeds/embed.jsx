import PropTypes from 'prop-types'
import React from 'react'

export const Embed = (props) => {
  const { embed_code } = props

  return (
    <div
      className='Embed'
      dangerouslySetInnerHTML={{__html: embed_code}}
    />
  )
}

Embed.propTypes = {
  embed_code: PropTypes.string
}
