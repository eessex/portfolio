import { NextResponse } from 'next/server'

import { fetchLinks } from '@/lib/links/data'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchLinks(cursor, query)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}
