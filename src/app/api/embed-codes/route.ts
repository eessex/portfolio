import { NextResponse } from 'next/server'

import { fetchEmbedCodes } from '@/lib/embed-codes/data'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') || undefined
  console.info('FETCHING embed codes with cursor:', cursor)

  try {
    const result = await fetchEmbedCodes(cursor)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}
