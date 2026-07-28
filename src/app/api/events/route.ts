import { isAuthed } from '@/lib/auth/guard'
import { fetchEvents } from '@/lib/events/data'
import { formatAuthedApiResponseJSON } from '@/lib/util'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const projectId = searchParams.get('projectId') || undefined

  try {
    const result = await fetchEvents(
      await isAuthed(),
      projectId,
      cursor,
      query
    )
    return formatAuthedApiResponseJSON(result)
  } catch (cause) {
    throw new Error('Failed to fetch events.', { cause })
  }
}
