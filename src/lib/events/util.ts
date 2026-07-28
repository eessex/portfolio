import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'

export function sortEventsByCategory(
  events: EventClient[]
): FetchEventsResult {
  const upcomingEvents: EventClient[] = []
  const pastEvents: EventClient[] = []

  events.forEach((event) => {
    ;(event.isUpcoming ? upcomingEvents : pastEvents).push(event)
  })

  upcomingEvents.sort(
    (a, b) =>
      new Date(a.startTime).getTime() -
      new Date(b.startTime).getTime()
  )
  pastEvents.sort(
    (a, b) =>
      new Date(b.startTime).getTime() -
      new Date(a.startTime).getTime()
  )

  return {
    upcomingEvents,
    pastEvents
  }
}
