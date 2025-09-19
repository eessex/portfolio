import {
  baseContentSchema,
  basePageSchema,
  date,
  embeddedItemIdSchemas,
  shortText,
  uuid
} from '@/lib/schemas'
import { z } from 'zod'

export const publishedEditionTypes = [
  '2xCassette',
  '2xLP',
  'CD',
  'Cassette',
  'Digital',
  'LP',
  'iOSApp'
] as const

/**
 * Represents a published edition of a release, such as a vinyl pressing, cassette or digital edition.
 * This is separate from the Release itself, which represents the overall work.
 * A release may have multiple editions, each with its own format, publish date, and publisher.
 * This allows for tracking different versions of a release, such as a first pressing and a reissue.
 */
export const publishedEditionSchema = z.lazy(() =>
  baseContentSchema.extend({
    buyLinkId: uuid.optional(),
    coverImageId: basePageSchema.shape.coverImageId,
    editionSize: z.number().int().optional(),
    format: z.enum(publishedEditionTypes),
    imageIds: embeddedItemIdSchemas.shape.imageIds,
    publishDate: date,
    publisher: shortText,
    releaseId: uuid
  })
)
