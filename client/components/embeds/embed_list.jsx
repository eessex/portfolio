import PropTypes from 'prop-types'
import React from 'react'

export const EmbedList = (props) => {
  const { embed_urls } = props

  if (embed_urls && embed_urls.length) {
    return (
      <div className='EmbedList'>
        {embed_urls.map( (embed, i) =>
          <div className='EmbedList__item' key={i}>
            <Embed item={embed} />
          </div>
        )}
      </div>
    )
  }
}

EmbedList.propTypes = {
  items: PropTypes.array
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