import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
import { ItemTable } from './item_table'
import { ItemGrid } from './item_grid'
import { H1 } from 'client/styles/text'

export const ListItem = props => {
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

export const Item = styled.div`
  a {
    text-decoration: none;
  }

  ${props => props.published === false && `
    opacity: .45;
  `}

  // layouts
  ${props => props.layout === 'list' && `
    &:first-child {
      h1 {
        margin-top: 0;
      }
    }
  `}

  ${props => props.layout === 'table' && `
    border-top: 1px solid black;

    &:last-child {
      border-bottom: 1px solid black;
    }
    ${props.condensed === true && `
      &:first-child {
        border-top: none;
      }
    `}
  `}
`

const GridItem = styled(Col)`
  padding: 0;
`

ListItem.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  formats: PropTypes.array,
  image: PropTypes.object,
  layout: PropTypes.string,
  slug: PropTypes.string.isRequired,
  title: PropTypes.string,
  venue: PropTypes.string
}
