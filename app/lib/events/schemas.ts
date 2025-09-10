import {
  basePageSchema,
  date,
  embeddedItemIdSchemas,
  hydratedItemIdSchemas,
  url,
  uuid
} from '@/lib/schemas'

/**
 * An event, such as a concert, performance, opening, or screening.
 */
export const eventSchema = basePageSchema.extend({
  ...embeddedItemIdSchemas.shape,
  endTime: date.optional(),
  startTime: date,
  ticketLink: url.optional(),
  venueId: uuid,
})

export const eventClientSchema = eventSchema.extend(
  hydratedItemIdSchemas.pick({
    coverImage: true,
    featuredEmbedCode: true,
    embedCodes: true,
    images: true,
    links: true,
    venue: true
  }).shape
)
