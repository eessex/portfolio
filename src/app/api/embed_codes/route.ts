import { NextResponse } from 'next/server'

import { fetchEmbedCodes } from '@/lib/embed-codes/cached'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined

  try {
    const result = await fetchEmbedCodes(cursor, query)
    return NextResponse.json(result)
  } catch (cause) {
    throw new Error('Failed to fetch embed codes.', { cause })
  }
}
