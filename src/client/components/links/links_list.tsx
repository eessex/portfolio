import styled from 'styled-components'
import React from 'react'
import { Link } from 'client/typings'

interface LinksListProps {
  links: Link[]
}

export const LinksList: React.SFC<LinksListProps> = ({ links }) => {
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
