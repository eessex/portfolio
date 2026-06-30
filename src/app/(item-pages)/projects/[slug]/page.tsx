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
  fetchProjectById,
  fetchProjectsRaw
} from '@/lib/projects/data'
import { fetchReleases } from '@/lib/releases/data'
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

  const resolved = await resolveSlug('projects', slug)

  if (!resolved) {
    redirect('/projects')
  }

  if (resolved.isRedirect) {
    redirect(`/projects/${resolved.slug}`)
  }

  const [project, releases, events] = await Promise.all([
    fetchProjectById(resolved.id, !!session?.user),
    fetchReleases(!!session?.user, resolved.id),
    fetchEvents(!!session?.user, resolved.id)
  ])

  if (!project) {
    redirect('/projects')
  }

  return (
    <ItemLayout item={project}>
      <Suspense fallback={<Loading />}>
        <ItemsTable path='releases' initialItems={releases} />
        <ItemsTable path='events' initialItems={events} />
      </Suspense>
    </ItemLayout>
  )
}
