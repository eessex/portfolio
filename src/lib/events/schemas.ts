import { z } from 'zod'

import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { projectSchema } from '@/lib/projects/schemas'
import {
  contentFields,
  ownershipFields,
  relationFields,
  systemFields,
  taxonomyFields
} from '@/lib/schemas/fields'
import { date, url, uuid } from '@/lib/schemas/primitives'
import { venueSchema } from '@/lib/venues/schemas/db'

/**
 * An event, such as a concert, performance, opening, or screening.
 */
export const eventSchema = z.object({
  ...systemFields,
  ...taxonomyFields,
  ...ownershipFields,
  ...contentFields,
  coverImageId: relationFields.coverImageId,
  embedCodeIds: relationFields.embedCodeIds,
  endTime: date.optional(),
  imageIds: relationFields.imageIds,
  linkIds: relationFields.linkIds,
  path: z.literal('events'),
  startTime: date,
  ticketLink: url.optional(),
  venueId: uuid
})

export const eventClientSchema = eventSchema.extend({
  coverImage: z.lazy(() => imageSchema).optional(),
  // computed by SQL (start_time > now()) at query time, so all
  // consumers of one response agree on the upcoming/past boundary
  isUpcoming: z.boolean().optional(),
  embedCodes: z.lazy(() => embedCodeSchema.array()).optional(),
  featuredEmbedCode: z.lazy(() => embedCodeSchema).optional(),
  images: z.lazy(() => imageSchema.array()).optional(),
  links: z.lazy(() => linkSchema.array()).optional(),
  project: z.lazy(() => projectSchema).optional(),
  venue: z.lazy(() => venueSchema).optional()
})

export const createEventSchema = eventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
