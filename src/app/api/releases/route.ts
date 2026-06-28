import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { fetchReleases } from '@/lib/releases/data'

export async function GET(req: Request) {
  const session = await auth()
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const projectSlug = searchParams.get('projectSlug') || undefined

  try {
    const result = await fetchReleases(
      !!session?.user,
      projectSlug,
      cursor,
      query
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch releases.')
  }
}
