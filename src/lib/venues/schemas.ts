import { z } from 'zod'

import {
  baseDashboardItemSlugsSchema,
  defaultSchema,
  shortText,
  url,
  uuid
} from '@/lib/schemas'

/**
 * A venue where an event or exhibition takes place.
 */
export const venueSchema = z.lazy(() =>
  defaultSchema.extend({
    address: shortText.optional(),
    city: shortText,
    name: shortText.optional(),
    state: shortText.optional(),
    country: shortText.optional(),
    url: url.optional(),
    timezone: shortText.max(100).optional(),
    primaryVenueId: uuid.optional()
  })
)
/**
 * Extends `venueSchema` with the pages that embed it.
*/
export const dashboardVenueSchema = z.lazy(() =>
  baseDashboardItemSlugsSchema.and(venueSchema)
)
