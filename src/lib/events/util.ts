import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import { isUpcomingDate } from '@/ui/util'

export function sortEventsByCategory(
  events: EventClient[]
): FetchEventsResult {
  const upcomingEvents = events
    .filter((event) => isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return (
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
      )
    })
  const pastEvents = events
    .filter((event) => !isUpcomingDate(event.startTime))
    .sort((a, b) => {
      return (
        new Date(b.startTime).getTime() -
        new Date(a.startTime).getTime()
      )
    })
  return {
    upcomingEvents,
    pastEvents
  }
}
