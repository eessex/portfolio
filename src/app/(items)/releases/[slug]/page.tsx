import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(items)/item-layout'
import {
  fetchReleaseBySlug,
  fetchReleases
} from '@/lib/releases/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata ({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchReleaseBySlug)
}

export async function generateStaticParams () {
  return generateItemStaticParams(fetchReleases)
}

export default async function ReleasePage ({ params }: PageItemProps) {
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
