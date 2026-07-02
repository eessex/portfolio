import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { auth } from '@/auth'
import { fetchEvents } from '@/lib/events/data'
import { fetchCachedProjectBySlug } from '@/lib/projects/cached'
import {
  fetchProjectBySlug,
  fetchProjectsRaw
} from '@/lib/projects/data'
import { fetchReleases } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
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
  const [project, releases, events] = await Promise.all([
    fetchProjectBySlug(slug, !!session?.user),
    fetchReleases(!!session?.user, slug),
    fetchEvents(!!session?.user, slug)
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
