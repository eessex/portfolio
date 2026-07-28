import { isAuthed } from '@/lib/auth/guard'
import { fetchProjects } from '@/lib/projects/data'
import { formatAuthedApiResponseJSON } from '@/lib/util'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchProjects(
      await isAuthed(),
      cursor,
      query
    )
    return formatAuthedApiResponseJSON(result)
  } catch (cause) {
    throw new Error('Failed to fetch projects.', { cause })
  }
}
