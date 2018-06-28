import PropTypes from 'prop-types'
import React from 'react'
import { imageIsVertical } from 'client/utils'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import ItemEdit from './item_edit'

export const Item = props => {
  const {
    editing,
    model,
    item
  } = props

  const images = item && item.images || []
  const isPublication = model === 'publications'
  const isGrid = images.length !== 0 && (imageIsVertical(images[0]) || isPublication)

  return (
    <div>
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
  editing: PropTypes.bool,
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.bool,
  layout: PropTypes.string,
  model: PropTypes.string
}
