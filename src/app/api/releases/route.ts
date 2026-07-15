import { auth } from '@/auth'
import { fetchReleases } from '@/lib/releases/data'
import { formatAuthedApiResponseJSON } from '@/lib/util'

export async function GET(req: Request) {
  const session = await auth()
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const projectId = searchParams.get('projectId') || undefined

  try {
    const result = await fetchReleases(
      !!session?.user,
      projectId,
      cursor,
      query
    )
    return formatAuthedApiResponseJSON(result)
  } catch (cause) {
    throw new Error('Failed to fetch releases.', { cause })
  }
}
