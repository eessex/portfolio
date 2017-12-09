import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from '../../../utils/index.js'
import { ListItem } from './components/list_item.jsx'

export const ItemsList = (props) => {
  const {
    children,
    list,
    model,
    title
  } = props

  const layout = props.layout || 'list'
  const listItems = children ? children : renderListItems(layout, list, model)
  const layoutClass = layout ? ' ' + layout : ''
  const className = ' ItemsList--' + model + layoutClass
  const renderedTitle = title && title.length ? title : capitalize(model)

  return(
    <div className={'ItemsList' + className}>
      {title &&
        <Row className='ItemsList__header'>
          <Col xl>
            <h5>{renderedTitle}</h5>
          </Col>
        </Row>
      }
      {renderList(layout, listItems)}
    </div>
  )
}

function renderList (layout, items) {
  if (layout === 'table') {
    return (
      <div className='ItemsList__list'>
        {items}
      </div>
    )
  } else if (layout === 'grid') {
    return (
      <Row className='ItemsList__list'>
        {items}
      </Row>
    )
  } else {
    return (
      <Row className='ItemsList__list'>
        <Col xl>
          {items}
        </Col>
      </Row>
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
        date={date}
        image={item.images[0]}
        layout={layout}
        slug={`/${model}/${item.slug || item._id}`}
        title={item.title}
        venue={venue}
        published={item.published}
      />
    )
  })
}

ItemsList.propTypes = {
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired,
  title: PropTypes.any
}
