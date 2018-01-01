import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from '../../utils/index.js'
import { ListItem } from './components/list_item.jsx'

export const ItemsList = (props) => {
  const {
    children,
    className,
    comingSoon,
    list,
    model,
    title
  } = props

  const layout = props.layout || 'list'
  const listItems = children ? children : renderListItems(layout, list, model)
  const layoutClass = layout ? ' ' + layout : ''
  const classModelName = 'ItemsList--' + model + layoutClass
  const renderedTitle = title && title.length ? title : capitalize(model)

  return(
    <div className={`ItemsList ${classModelName} ${className || ''}`}>
      {title && layout !== 'grid' &&
        renderTitle(renderedTitle, props.layout)
      }
      {list.length
        ? renderList(props.layout, listItems, title && renderedTitle)
        : comingSoon && 'Coming Soon'
      }
    </div>
  )
}

function renderTitle (title, layout) {
  if (layout && layout!== 'grid') {
    return (
      <Row className='ItemsList__header h4'>
        <Col xl>
          {title}
        </Col>
      </Row>
    )
  } else {
    return (
      <div className='ItemsList__header h4'>
        {title}
      </div>
    )
  }
}

function renderList (layout, items, title) {
  if (layout === 'table') {
    return (
      <div className='ItemsList__list'>
        {items}
      </div>
    )
  } else if (layout === 'grid') {
    return (
      <Row className='ItemsList__list'>
        {title &&
          <Col xs={12} lg={2}>
            {renderTitle(title, layout)}
          </Col>
        }
        {items}
      </Row>
    )
  } else {
    return (
      <div className='ItemsList__list'>
        {items}
      </div>
    )
  }
}

function renderListItems (layout, list, model) {
  return list.map((item, i) => {
    const date = getDate(model, item)
    const venue = getVenue(item.venue)

    return (
      <ListItem
        key={i}
        artist={item.artist}
        date={date}
        image={item.images[0]}
        layout={layout}
        slug={`/${model}/${item.slug || item._id}`}
        title={item.title}
        venue={venue}
        published={item.published}
        publisher={item.publisher}
      />
    )
  })
}

ItemsList.propTypes = {
  comingSoon: PropTypes.bool,
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired,
  title: PropTypes.any
}
