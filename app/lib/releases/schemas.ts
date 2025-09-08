import {
  basePageSchema,
  date,
  embeddedItemIdSchemas,
  hydratedItemIdSchemas,
  shortText
} from '@/lib/scemas'
import { z } from 'zod'

export const releaseTypes = [
  'album',
  'ep',
  'soundtrack',
  'feature',
  'compilation',
  'collaborative_release',
  'single'
] as const

/**
 * A music release, such as an album, EP, single, or soundtrack.
 */
export const releaseSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas.shape,
  artist: shortText,
  type: z.enum(releaseTypes),
  releaseDate: date,
})

export const releaseClientSchema = releaseSchema.extend(
  hydratedItemIdSchemas.pick({
    coverImage: true,
    embedCodes: true,
    featuredEmbedCode: true,
    images: true,
    links: true,
    publishedEditions: true
  }).shape
)
