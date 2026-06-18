import { z } from 'zod'

import {
  basePageSchema,
  date,
  embeddedItemIdSchemas,
  url,
  uuid
} from '@/lib/schemas'
import { hydratedItemIdSchemas } from '@/lib/schemas/hydratedItemIdSchemas'

/**
 * An event, such as a concert, performance, opening, or screening.
 */
export const eventSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas.shape,
  endTime: date.optional(),
  startTime: date,
  ticketLink: url.optional(),
  venueId: uuid,
  path: z.literal('events')
})

export const eventClientSchema = eventSchema.extend(
  hydratedItemIdSchemas.pick({
    coverImage: true,
    featuredEmbedCode: true,
    embedCodes: true,
    images: true,
    links: true,
    project: true,
    venue: true
  }).shape
)

export const createEventSchema = eventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
