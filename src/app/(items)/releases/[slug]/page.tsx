import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import ItemLayout, { formatItemMeta } from '@/app/(items)/item-layout'
import {
  fetchReleaseBySlug,
  fetchReleases
} from '@/lib/releases/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata ({ params }: PageItemProps) {
  const { slug } = await params
  const release = await fetchReleaseBySlug(slug)
  if (!slug || !release) return notFound()

  return formatItemMeta(release)
}

export async function generateStaticParams () {
  const items = await fetchReleases()
  return Object.values(items).flat().map(i => ({ slug: i.slug }))
}

export default async function ReleasesPage ({ params }: PageItemProps) {
  const [
    { slug },
    session
  ] = await Promise.all([
    params,
    auth()
  ])

  const release = await fetchReleaseBySlug(slug, !!session?.user)
  if (!release) return notFound()

  return (
    <ItemLayout item={release} />
  )
}
