import PropTypes from 'prop-types'
import React from 'react'
import { Col } from 'react-styled-flexboxgrid'
// import { Link } from 'react-router-dom'
import { ItemTable } from './item_table.jsx'
import { ItemGrid } from './item_grid.jsx'

export const ListItem = (props) => {
  const {
    artist,
    date,
    image,
    format,
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
          <ItemTable
            artist={artist}
            date={date}
            format={format}
            title={title}
            venue={venue}
            publisher={publisher}
          />
        </a>
      </div>
    )

  } else if (layout === 'grid') {
    return(
      <Col
        xs={12}
        sm={6}
        xl={4}
        className='ListItem'
        data-published={published}>
        <a href={slug}>
          <ItemGrid
            artist={artist}
            date={date}
            title={title}
            venue={venue}
            publisher={publisher}
            image={image}
          />
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
  image: PropTypes.object,
  layout: PropTypes.string,
  slug: PropTypes.string.isRequired,
  title: PropTypes.string,
  venue: PropTypes.string
}
