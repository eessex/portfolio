import type { z } from 'zod'

import type { eventClientSchema, eventSchema } from '@/lib//events/schemas'

export type Event = z.infer<typeof eventSchema>
export type EventClient = z.infer<typeof eventClientSchema>

export interface FetchEventsResult {
  upcomingEvents: EventClient[]
  pastEvents: EventClient[]
}
