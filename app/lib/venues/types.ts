import { dashboardVenueSchema, venueSchema } from '@/lib/venues/schemas'
import { z } from 'zod'

export type Venue = z.infer<typeof venueSchema>
export type DashboardVenue = z.infer<typeof dashboardVenueSchema>
