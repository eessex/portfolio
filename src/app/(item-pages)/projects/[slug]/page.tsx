import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { auth } from '@/auth'
import { fetchEvents } from '@/lib/events/data'
import {
  fetchCachedProjectById,
  fetchCachedProjectBySlug
} from '@/lib/projects/cached'
import { fetchProjectsRaw } from '@/lib/projects/data'
import { fetchReleases } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchCachedProjectBySlug)
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchProjectsRaw)
}

export default async function ProjectPage({ params }: PageItemProps) {
  const [{ slug }, session] = await Promise.all([params, auth()])
  const resolved = await resolveSlug(PagePaths.projects, slug)

  if (!resolved) {
    redirect(`/${PagePaths.projects}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${PagePaths.projects}/${resolved.slug}`)
  }

  const [project, releases, events] = await Promise.all([
    fetchCachedProjectById(resolved.id, !!session?.user),
    fetchReleases(!!session?.user, resolved.id),
    fetchEvents(!!session?.user, resolved.id)
  ])

  if (!project) {
    redirect(`/${PagePaths.projects}`)
  }

  return (
    <ItemLayout item={project}>
      <Suspense fallback={<Loading />}>
        <ItemsTable
          path={PagePaths.releases}
          initialItems={releases}
        />
        <ItemsTable path={PagePaths.events} initialItems={events} />
      </Suspense>
    </ItemLayout>
  )
}
