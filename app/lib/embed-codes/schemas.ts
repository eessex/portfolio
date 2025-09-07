import {
  baseContentSchema,
  baseDashboardItemSchema,
  longText,
  shortText
} from '@/lib/scemas'
import { z } from 'zod'

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
  'album_stream',
  'dj_set',
  'interview',
  'live_performance',
  'official_music_video',
  'other',
  'podcast',
  'radio_show',
  'track_stream'
] as const

/**
 * An iframe embed code, such as a Bandcamp or YouTube embed, with metadata.
 */
export const embedCodeSchema = baseContentSchema.extend({
  caption: shortText.optional(),
  iframe: longText.min(12),
  type: z.enum(embedCodeTypes).optional(),
})

/**
 * Extends `embedCodeSchema` with the pages that embed it.
 */
export const dashboardEmbedCodeSchema = embedCodeSchema.extend(baseDashboardItemSchema.shape)
