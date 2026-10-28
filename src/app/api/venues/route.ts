import { NextResponse } from 'next/server'

import { fetchVenues } from '@/lib/venues/cached'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchVenues(cursor, query)
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch venues.', { cause })
  }
}
