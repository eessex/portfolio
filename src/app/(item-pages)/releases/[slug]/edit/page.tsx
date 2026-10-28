import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import {
  editItemTitle,
  generateEditItemMetadata
} from '@/app/(item-pages)/edit-item-metadata'
import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'
import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { fetchCachedReleaseById } from '@/lib/releases/cached'
import { fetchReleaseById } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'Edit Release'

export async function generateMetadata({ params }: PageItemProps) {
  return generateEditItemMetadata(
    params,
    PagePaths.releases,
    fetchCachedReleaseById,
    title
  )
}

export default function EditReleasePage({ params }: PageItemProps) {
  return (
    <Suspense
      fallback={
        <EditPageLayout title={title}>
          <Loading />
        </EditPageLayout>
      }
    >
      <EditRelease params={params} />
    </Suspense>
  )
}

async function EditRelease({ params }: PageItemProps) {
  const { slug } = await params
  const id = await resolveEditItemId(PagePaths.releases, slug)
  // uncached: saving a stale form drops child ids added since
  const release = await fetchReleaseById(id, true)

  if (!release) return notFound()

  return (
    <EditPageLayout title={editItemTitle(title, release)}>
      <EditReleaseForm release={release} />
    </EditPageLayout>
  )
}
