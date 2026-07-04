import type z from 'zod'

import { relationSlugArrays } from '@/lib/schemas/fields'
import { venueSchema } from '@/lib/venues/schemas/db'

/**
 * Extends `venueSchema` with the pages that embed it.
 */
export const dashboardVenueSchema = venueSchema.extend(
  relationSlugArrays
)
export type DashboardVenue = z.infer<typeof dashboardVenueSchema>
