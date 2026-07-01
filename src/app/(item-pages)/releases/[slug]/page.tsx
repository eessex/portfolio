import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { auth } from '@/auth'
import {
  fetchCachedReleaseById,
  fetchCachedReleaseBySlug
} from '@/lib/releases/cached'
import { fetchReleasesRaw, path } from '@/lib/releases/data'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchCachedReleaseBySlug)
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchReleasesRaw)
}

export default async function ReleasePage({ params }: PageItemProps) {
  const [{ slug }, session] = await Promise.all([params, auth()])
  const resolved = await resolveSlug(path, slug)

  if (!resolved) {
    redirect(`/${path}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${path}/${resolved.slug}`)
  }

  const release = await fetchCachedReleaseById(
    resolved.id,
    !!session?.user
  )

  if (!release) {
    redirect(`/${path}`)
  }

  return <ItemLayout item={release} />
}
