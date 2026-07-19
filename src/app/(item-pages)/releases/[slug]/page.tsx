import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedReleaseById } from '@/lib/releases/cached'
import { fetchReleasesRaw } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(
    params,
    PagePaths.releases,
    fetchCachedReleaseById
  )
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchReleasesRaw)
}

export default async function ReleasePage({ params }: PageItemProps) {
  const { slug } = await params
  const resolved = await resolveSlug(PagePaths.releases, slug)

  if (!resolved) {
    redirect(`/${PagePaths.releases}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${PagePaths.releases}/${resolved.slug}`)
  }

  const release = await fetchCachedReleaseById(resolved.id, false)

  if (release) {
    return <ItemLayout item={release} />
  }

  const draft = await fetchCachedReleaseById(
    resolved.id,
    await isAuthed()
  )

  if (!draft) {
    redirect(`/${PagePaths.releases}`)
  }

  return <ItemLayout item={draft} />
}
