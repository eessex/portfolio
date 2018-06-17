import PropTypes from 'prop-types'
import React from 'react'

export const LinksList = props => {
  const { links } = props

  return (
    <div>
      {links.length > 0 && links.map((link, i) =>
        <div key={i}>
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
