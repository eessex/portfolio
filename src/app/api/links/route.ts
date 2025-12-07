import { NextResponse } from 'next/server'

import { fetchLinks } from '@/lib/links/data'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined

  try {
    const result = await fetchLinks(cursor)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch links.')
  }
}
