// Adapted from https://github.com/artsy/reaction/blob/master/src/Utils/fillwidth.ts

import { extend, reduce } from 'lodash'

const MAX_ITERATIONS = 1000
const DEFAULT_WIDTH = 650
const TARGET_HEIGHT = 350

const resizeHeight = (img, dir) => {
  img.width += (img.width / img.height) * dir
  img.height += dir
}

export const fillwidth = (
  items,
  gutter = 10,
  targetHeight = TARGET_HEIGHT
) => {
  const totalWhitespace = () => {
    return (items.length - 1) * gutter
  }

  const widthDiff = dim => {
    const currentWidth = reduce(
      dim,
      (sum, img) => {
        return sum + img.width
      },
      0
    )
    return DEFAULT_WIDTH - currentWidth - totalWhitespace()
  }

  // Get initial dimensions based on the targetHeight
  const dimensions = items.map(item => {
    const newItem = extend(item, {
      width: targetHeight * (item.aspect || 1),
      height: targetHeight
    })
    return newItem
  })

  // If the total width difference is too small or negative we need to scale down. If not, scale up.
  const dir = widthDiff(dimensions) < 1 ? -1 : 1

  // Keep looping until we get an acceptable width difference
  let count = 0
  while (widthDiff(dimensions) <= 1) {
    for (const img of dimensions) {
      resizeHeight(img, dir)
      if (widthDiff(dimensions) > 1) {
        break
      }
    }
    // Seeing as there have been a couple of bugs in this code and there are no proper tests yet, let’s at least make
    // sure to no longer run into infinite loops.
    count++
    if (count === MAX_ITERATIONS) {
      const data = {
        items,
        defulatWidth: DEFAULT_WIDTH,
        gutter,
        targetHeight,
        dir,
        dimensions
      }
      console.error(
        `Was unable to calculate a filling width for data: ${JSON.stringify(
          data
        )}`
      )
      break
    }
  }

  // Round image dimensions to whole numbers
  for (const img of dimensions) {
    img.width = Math.floor(img.width)
    img.height = Math.floor(img.height)
    if (widthDiff(dimensions) === 0) {
      break
    }
  }

  // Voila, sizes for our images
  return dimensions
}
