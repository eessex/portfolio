import { z } from 'zod'

import {
  baseContentSchema,
  baseDashboardItemSlugsSchema,
  longText,
  shortText
} from '@/lib/schemas'

/**
 * The variety of media displayed in an iframe embed.
 */
export const embedCodeTypes = [
  'audio',
  'video'
] as const

/**
 * The type of content depicted in the embed.
 * TODO: DB migration to add this column.
 */
export const embedCodeContentTypes = [
  'dj_set',
  'documentation',
  'interview',
  'film',
  'live_performance',
  'official_audio',
  'official_music_video',
  'other',
  'podcast',
  'radio_show',
  'trailer'
] as const

const embedCodeBaseSchema = z.lazy(() => z.object({
  caption: shortText.optional(),
  iframe: longText.min(12),
  type: z.enum(embedCodeTypes).optional()
})
)

/**
 * An iframe embed code, such as a Bandcamp or YouTube embed, with metadata.
 */
export const embedCodeSchema = z.lazy(() =>
  baseContentSchema.and(embedCodeBaseSchema)
)

export const createEmbedCodeSchema = z.lazy(() =>
  baseContentSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }).and(embedCodeBaseSchema)
)

/**
 * Extends `embedCodeSchema` with the pages that embed it.
 */
export const dashboardEmbedCodeSchema = z.lazy(() =>
  baseDashboardItemSlugsSchema.and(embedCodeSchema)
)
