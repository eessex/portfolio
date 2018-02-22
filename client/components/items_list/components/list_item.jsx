import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
import { ItemTable } from './item_table.jsx'
import { ItemGrid } from './item_grid.jsx'

export const ListItem = (props) => {
  const {
    artist,
    condensed,
    date,
    image,
    formats,
    layout,
    slug,
    title,
    venue,
    published,
    publisher
  } = props

  if (layout === 'table') {
    return (
      <div
        className='ListItem'
        data-published={published}
      >
        <a href={slug}>
          <ItemTable {...props} />
        </a>
      </div>
    )

  } else if (layout === 'grid') {
    return(
      <Col
        xs={12}
        sm={condensed ? 4 : 6}
        lg={condensed ? 3 : 5}
        className='ListItem'
        data-published={published}
        data-condensed={condensed}
      >
        <a href={slug}>
          <ItemGrid {...props} />
        </a>
      </Col>
    )

  } else {
    return(
      <div
        className='ListItem'
        data-published={published}
      >
        <a href={slug}>
          <h1>{title}</h1>
        </a>
      </div>
    )
  }
}

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
