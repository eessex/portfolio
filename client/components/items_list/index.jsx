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
    label,
    list,
    model
  } = props

  const layout = props.layout || 'list'
  const listItems = children ? children : renderListItems(layout, list, model)
  const layoutClass = layout ? ' ' + layout : ''
  const classModelName = 'ItemsList--' + model + layoutClass
  const renderedLabel = label && label.length ? label : capitalize(model)

  return(
    <div className={`ItemsList ${classModelName} ${className || ''}`}>
      {label && layout !== 'grid' &&
        renderLabel(renderedLabel, props.layout)
      }
      {list.length
        ? renderList(props.layout, listItems, label && renderedLabel)
        : comingSoon && 'Coming Soon'
      }
    </div>
  )
}

function renderLabel (label, layout) {
  if (layout && layout!== 'grid') {
    return (
      <Row className='ItemsList__header h4'>
        <Col xl>
          {label}
        </Col>
      </Row>
    )
  } else {
    return (
      <div className='ItemsList__header h4'>
        {label}
      </div>
    )
  }
}

function renderList (layout, items, label) {
  if (layout === 'table') {
    return (
      <div className='ItemsList__list'>
        {items}
      </div>
    )
  } else if (layout === 'grid') {
    return (
      <Row className='ItemsList__list'>
        {label &&
          <Col xs={12} lg={2}>
            {renderLabel(label, layout)}
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
        formats={item.formats}
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
  label: PropTypes.string,
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired
}
