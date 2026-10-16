import { NextResponse } from 'next/server'

import { fetchLinks } from '@/lib/links/data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const isPressParam = searchParams.get('isPress')
  const isPress =
    isPressParam === null ? undefined : isPressParam === 'true'

  try {
    const result = await fetchLinks(cursor, query, isPress)
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch links.', { cause })
  }
}
