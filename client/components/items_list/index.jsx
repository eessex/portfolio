import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from '../../utils/index.js'
import { ListItem } from './components/list_item.jsx'

export const ItemsList = (props) => {
  const {
    children,
    comingSoon,
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
        renderTitle(renderedTitle, props.layout)
      }
      {list.length
        ? renderList(props.layout, listItems)
        : comingSoon && 'Coming Soon'
      }
    </div>
  )
}

function renderTitle (title, layout) {
  if (layout) {
    <Row className='ItemsList__header'>
      <Col xl>
        {title}
      </Col>
    </Row>

  } else {
    return (
      <div className='ItemsList__header'>
        {title}
      </div>
    )
  }
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
  comingSoon: PropTypes.bool,
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired,
  title: PropTypes.any
}
