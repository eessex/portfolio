import styled from 'styled-components'
import React from 'react'
import { Link } from 'client/typings'

export const LinksList: React.SFC<{ links: Link[] }> = ({ links }) => {
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

const LinksContainer = styled.div`
  margin-bottom: 1.75em;
`
