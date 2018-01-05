import PropTypes from 'prop-types'
import React from 'react'

export const EmbedList = (props) => {
  const { embed_codes, className } = props

  if (embed_codes && embed_codes.length) {
    return (
      <div className={`EmbedList ${className}`}>
        {embed_codes.map( (embed, i) =>
          <div className='EmbedList__item' key={i}>
            <Embed item={embed} />
          </div>
        )}
      </div>
    )
  } else {
    return <div />
  }
}

EmbedList.propTypes = {
  className: PropTypes.string,
  embed_codes: PropTypes.array
}

export const Embed = (props) => {
  const { item } = props

  return (
    <div
      className='Embed'
      dangerouslySetInnerHTML={{__html: item}}
    />
  )
}

Embed.propTypes = {
  item: PropTypes.string
}