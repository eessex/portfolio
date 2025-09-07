import {
  baseContentSchema,
  baseDashboardItemSchema,
  date,
  shortText,
  url
} from '@/lib/scemas'
import { z } from 'zod'

export const linkTypes = [
  'press',
  'social',
  'buy_link',
  'stream_link'
] as const

/**
 * A link to an external resource with metadata.
 */
export const linkSchema = baseContentSchema.extend({
  attribution: shortText.optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  publishDate: date.optional(),
  quotation: shortText.optional(),
  type: z.enum(linkTypes).optional(),
  url
})

export const dashboardLinkSchema = linkSchema.extend(baseDashboardItemSchema.shape)
