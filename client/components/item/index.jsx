import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { imageIsVertical } from '../../utils/index.js'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'

export const Item = (props) => {
  const {
    className,
    item,
    label,
    labelLink,
    layout,
    model,
    onChange,
    setEditing
  } = props

  const images = item.images || []
  const isGrid = images.length > 0 && imageIsVertical(images[0]) || images.length && model === 'publications'
  const gridCoverImage = images.length > 0 ? images[0] : undefined


  return (
    <div className={`Item Item--${model}`}>
      {isGrid
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
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
