import { NextResponse } from 'next/server'

import { fetchImages } from '@/lib/images/data'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined

  try {
    const result = await fetchImages(cursor)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch images.')
  }
}
