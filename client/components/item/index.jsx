import PropTypes from 'prop-types'
import React from 'react'
import { imageIsVertical } from '../../utils/index.js'
import { LayoutColumn } from '../layout/column.jsx'
import { LayoutGrid } from '../layout/grid.jsx'
import ItemEdit from './item_edit.jsx'

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
        ? <ItemEdit {...props} />
        : isGrid
          ? <LayoutGrid {...props} />
          : <LayoutColumn {...props} />
      }
    </div>
  )
}

Item.propTypes = {
  className: PropTypes.string,
  editing: PropTypes.bool,
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.bool,
  layout: PropTypes.string,
  model: PropTypes.string
}
