import { z } from 'zod'

import {
  ownershipFields,
  relationFields,
  systemFields,
  taxonomyFields
} from '@/lib/schemas/fields'
import { date, shortText, uuid } from '@/lib/schemas/primitives'

export const publishedEditionTypes = [
  '2xCassette',
  '2xLP',
  'CD',
  'Cassette',
  'Digital',
  'LP',
  'iOSApp'
] as const
export const publishedEditionTypeSchema = z.enum(
  publishedEditionTypes
)
export const PublishedEditionTypes = Object.fromEntries(
  publishedEditionTypes.map((v) => [v, v])
) as {
  [K in (typeof publishedEditionTypes)[number]]: K
}
export type PublishedEditionType = z.infer<
  typeof publishedEditionTypeSchema
>

/**
 * Represents a published edition of a release, such as a vinyl pressing, cassette or digital edition.
 * This is separate from the Release itself, which represents the overall work.
 * A release may have multiple editions, each with its own format, publish date, and publisher.
 * This allows for tracking different versions of a release, such as a first pressing and a reissue.
 */
export const publishedEditionSchema = z.object({
  ...systemFields,
  ...ownershipFields,
  ...taxonomyFields,
  buyLinkId: uuid.optional(),
  coverImageId: relationFields.coverImageId,
  editionSize: z.number().int().optional(),
  format: publishedEditionTypeSchema,
  imageIds: relationFields.imageIds,
  publishDate: date,
  publisher: shortText,
  releaseId: uuid
})
