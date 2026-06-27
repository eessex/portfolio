import { NextResponse } from 'next/server'

import {
  fetchEmbedCodeByIframe,
  fetchEmbedCodes
} from '@/lib/embed-codes/data'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const cursor = searchParams.get('cursor') || undefined
  const query = searchParams.get('query') || undefined
  const iframe = searchParams.get('iframe') || undefined

  try {
    // If iframe is provided, fetch single embed code
    if (iframe) {
      const result = await fetchEmbedCodeByIframe(iframe)
      return NextResponse.json(result)
    }

    // Otherwise fallback to list fetch
    const result = await fetchEmbedCodes(cursor, query)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch embed codes.')
  }
}
