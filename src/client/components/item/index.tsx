import React from 'react'
import { imageIsVertical } from 'client/utils'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import ItemEdit from './item_edit'
import { ItemProps } from 'client/typings'

export const Item: React.SFC<ItemProps> = props => {
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
