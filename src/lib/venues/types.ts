import type { z } from 'zod'

import type {
  dashboardVenueSchema,
  venueSchema
} from '@/lib/venues/schemas'

export type Venue = z.infer<typeof venueSchema>
export type DashboardVenue = z.infer<typeof dashboardVenueSchema>
