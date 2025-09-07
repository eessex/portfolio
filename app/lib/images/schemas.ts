import {
  baseContentSchema,
  baseDashboardItemSchema,
  shortText,
  url
} from '@/lib/scemas'
import { z } from 'zod'

/**
 * An image with metadata.
 */
export const imageSchema = baseContentSchema.extend({
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
  isHiddenOnAboutPage: z.boolean().optional(),
  isPress: z.boolean().optional(),
  url
})

/**
 * Extends `imageSchema` with the pages that embed it.
 */
export const dashboardImageSchema = imageSchema.extend(baseDashboardItemSchema.shape)
