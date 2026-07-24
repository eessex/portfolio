import { NextResponse } from 'next/server'

import { fetchPublishers } from '@/lib/publishers/data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchPublishers(cursor, query)
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch publishers.', { cause })
  }
}
