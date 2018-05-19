import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { imageIsVertical } from '../../utils/index.js'
import { EditNav } from '../forms/edit_nav.jsx'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
import EditItem from './edit_item.jsx'

export const Item = props => {
  const {
    editing,
    model,
    item
  } = props

  const images = item && item.images || []
  const isPublication = model === 'publications'
  const isGrid = images.length && (imageIsVertical(images[0]) || isPublication)

  return (
    <div className={`Item Item--${model}`}>
      {editing
        ? <EditItem {...props} />
        : isGrid
          ? <LayoutGrid {...props} />
          : <LayoutColumn {...props} />
      }
    </div>
  )
}

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.bool,
  layout: PropTypes.string,
  model: PropTypes.string,
}
