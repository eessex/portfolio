import { eventClientSchema, eventSchema } from '@/lib//events/schemas'
import type { z } from 'zod'

export type Event = z.infer<typeof eventSchema>
export type EventClient = z.infer<typeof eventClientSchema>

export interface FetchEventsResult {
  upcomingEvents: EventClient[]
  pastEvents: EventClient[]
}
