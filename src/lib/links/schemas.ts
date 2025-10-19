import { z } from 'zod'

import {
  baseContentSchema,
  baseDashboardItemSlugsSchema
} from '@/lib/schemas'

export const linkTypes = [
  'press',
  'social',
  'buy_link',
  'stream_link'
] as const

const date = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }
  return val
}, z.date())

const linksBaseSchema = z.object({
  attribution: z.string().max(255).optional(),
  isHiddenOnAboutPage: z.boolean().optional(),
  publishDate: date.optional(),
  quotation: z.string().max(255).optional(),
  type: z.enum(linkTypes).optional(),
  url: z.string().max(255).url()
})

/**
 * A link to an external resource with metadata.
 */
export const linkSchema = z.lazy(() =>
  baseContentSchema.extend(linksBaseSchema.shape)
)

export const createLinkSchema = z.lazy(() =>
  baseContentSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }).and(linksBaseSchema)
)

/**
 * Extends `linkSchema` with the pages that embed it.
 */
export const dashboardLinkSchema = z.lazy(() =>
  baseDashboardItemSlugsSchema.and(linkSchema)
)
