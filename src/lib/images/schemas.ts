import { z } from 'zod'

import {
  baseContentSchema,
  baseDashboardItemSlugsSchema,
  bool,
  shortText,
  url
} from '@/lib/schemas'

const imageBaseSchema = z.lazy(() => z.object({
  alt: shortText.optional(),
  aspect: z.preprocess(val => {
    if (typeof val === 'number') {
      return Number(val.toFixed(4))
    }
    if (typeof val === 'string') {
      const num = parseFloat(val)
      return isNaN(num) ? val : Number(num.toFixed(4))
    }
    return val
  }, z.number().min(0.1).max(10)),
  caption: shortText.optional(),
  isHiddenOnAboutPage: bool.optional(),
  isPress: bool.optional(),
  url
}))

/**
 * An image with metadata.
 */
export const imageSchema = z.lazy(() =>
  baseContentSchema.and(imageBaseSchema)
)

export const createImageSchema = z.lazy(() =>
  baseContentSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }).and(imageBaseSchema)
)

/**
 * Extends `imageSchema` with the pages that embed it.
 */
export const dashboardImageSchema = z.lazy(() =>
  baseDashboardItemSlugsSchema.and(imageSchema)
)
