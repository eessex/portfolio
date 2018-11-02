import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const LinksList = props => {
  const { links } = props

  return (
    <LinksContainer>
      {links.length > 0 && links.map((link, i) =>
        <div key={i}>
          <a href={link.url} target='_blank'>
            {link.title ? link.title : link.url}
          </a>
        </div>
      )}
    </LinksContainer>
  )
}

LinksList.propTypes = {
  links: PropTypes.array.isRequired
}

const LinksContainer = styled.div`
  margin-bottom: 1.75em;
`
