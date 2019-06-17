import styled from 'styled-components'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
import { ItemTable } from './item_table'
import { ItemGrid } from './item_grid'
import { H1 } from 'client/styles/text'
import { ItemListLayout, ListItemProps } from 'client/typings'

export const ListItem: React.SFC<ListItemProps> = props => {
  const {
    condensed,
    layout,
    slug,
    title,
    published
  } = props

  switch (layout) {
    case 'grid': {
      return (
        <GridItem
          xs={12}
          sm={condensed ? 4 : 6}
          lg={condensed ? 3 : 5}
          condensed={condensed}
        >
          <Item layout={layout} published={published} condensed={condensed}>
            <a href={slug}>
              <ItemGrid {...props} />
            </a>
          </Item>
        </GridItem>
      )
    }
    case 'table': {
      return (
        <Item layout={layout} published={published} condensed={condensed}>
          <a href={slug}>
            <ItemTable {...props} />
          </a>
        </Item>
      )
    }
    default: {
      return (
        <Item layout={layout} published={published} condensed={condensed}>
          <a href={slug}>
            <H1>{title || 'Missing Title'}</H1>
          </a>
        </Item>
      )
    }
  }
}

export const Item = styled.div<{
  condensed?: boolean,
  published?: boolean,
  layout: ItemListLayout
}>`
  a {
    text-decoration: none;
  }

  ${({ published }) => published === false && `
    opacity: .45;
  `}

  // layouts
  ${({ layout }) => layout === 'list' && `
    &:first-child {
      h1 {
        margin-top: 0;
      }
    }
  `}

  ${({ condensed, layout }) => layout === 'table' && `
    border-top: 1px solid black;

    &:last-child {
      border-bottom: 1px solid black;
    }

    ${condensed === true && `
      &:first-child {
        border-top: none;
      }
    `}
  `}
`

const GridItem = styled(Col)<{ condensed?: boolean }>`
  padding: 0;
`
