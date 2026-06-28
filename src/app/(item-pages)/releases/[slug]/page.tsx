import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { auth } from '@/auth'
import { fetchCachedReleaseBySlug } from '@/lib/releases/cached'
import {
  fetchReleaseBySlug,
  fetchReleasesRaw
} from '@/lib/releases/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchCachedReleaseBySlug)
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchReleasesRaw)
}

export default async function ReleasePage({ params }: PageItemProps) {
  const [{ slug }, session] = await Promise.all([params, auth()])

  const release = await fetchReleaseBySlug(slug, !!session?.user)
  if (!release) {
    redirect('/releases')
  }

  return <ItemLayout item={release} />
}
