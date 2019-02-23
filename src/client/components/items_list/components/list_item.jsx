import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
import { ItemTable } from './item_table'
import { ItemGrid } from './item_grid'
import { H1 } from 'client/styles/text'
import { getSlug } from "client/utils"

export const ListItem = props => {
  const {
    condensed,
    item: {
      title,
      published
    },
    layout,
    model
  } = props
  const slug = getSlug(model, props.item)

  switch (layout) {
    case 'grid': {
      return (
        <GridItem
          xs={12}
          sm={condensed ? 4 : 6}
          lg={condensed ? 3 : 5}
          condensed={condensed}
        >
          <Item href={slug} published={published} condensed={condensed}>
            <ItemGrid {...props} />
          </Item>
        </GridItem>
      )
    }
    case 'table': {
      return (
        <Item href={slug} published={published} condensed={condensed}>
          <ItemTable {...props} />
        </Item>
      )
    }
    default: {
      return (
        <Item href={slug} published={published} condensed={condensed}>
          <H1>{title || 'Missing Title'}</H1>
        </Item>
      )
    }
  }
}

export const Item = styled.a`
  text-decoration: none;

  ${props => props.published === false && `
    opacity: .45;
  `}

  ${props => props.layout === 'list' && `
    &:first-child {
      h1 {
        margin-top: 0;
      }
    }
  `}
`

const GridItem = Col.extend`
  padding: 0;
`

ListItem.propTypes = {
  condensed: PropTypes.bool,
  item: PropTypes.object,
  layout: PropTypes.string,
  model: PropTypes.string
}
