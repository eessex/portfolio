import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedUpcomingEvents } from '@/lib/events/cached'
import { formatAuthedApiResponseJSON } from '@/lib/util'

export async function GET() {
  try {
    const events = await fetchCachedUpcomingEvents(await isAuthed())
    return formatAuthedApiResponseJSON(events)
  } catch (cause) {
    throw new Error('Failed to fetch upcoming events.', { cause })
  }
}
