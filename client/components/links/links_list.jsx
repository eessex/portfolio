import PropTypes from 'prop-types'
import React from 'react'

export const LinksList = props => {
  const { links } = props

  return (
    <div className='LinksList'>
      {links.length > 0 && links.map((link, i) =>
        <div className='LinksList__item' key={i}>
          <a href={link.url} target='_blank'>
            {link.title ? link.title : link.url}
          </a>
        </div>
      )}
    </div>
  )
}

LinksList.propTypes = {
  links: PropTypes.array.isRequired
}
