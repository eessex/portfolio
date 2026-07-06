import { NextResponse } from 'next/server'

import { fetchPublishedEditions } from '@/lib/published-editions/data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchPublishedEditions(cursor, query)
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch published editions.', {
      cause
    })
  }
}
