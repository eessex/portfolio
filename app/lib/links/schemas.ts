import {
  baseContentSchema,
  baseDashboardItemSlugsSchema,
  bool,
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
export const linkSchema = z.lazy(() =>
  baseContentSchema.extend({
    attribution: shortText.optional(),
    isHiddenOnAboutPage: bool.optional(),
    publishDate: date.optional(),
    quotation: shortText.optional(),
    type: z.enum(linkTypes).optional(),
    url
  })
)
/**
 * Extends `linkSchema` with the pages that embed it.
 */
export const dashboardLinkSchema = z.lazy(() =>
  baseDashboardItemSlugsSchema.and(linkSchema)
)
