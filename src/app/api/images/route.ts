import { NextResponse } from 'next/server'

import { fetchImages } from '@/lib/images/cached'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const type = searchParams.get('type') || undefined
  const isSvgExcluded = searchParams.get('isSvgExcluded') === 'true'

  try {
    const result = await fetchImages(cursor, query, type, {
      isSvgExcluded
    })
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch images.', { cause })
  }
}
