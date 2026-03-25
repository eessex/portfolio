import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { fetchEvents } from '@/lib/events/data'
import {
  fetchProjectBySlug,
  fetchProjects
} from '@/lib/projects/data'
import { fetchReleases } from '@/lib/releases/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

export async function generateMetadata ({ params }: PageItemProps) {
  return generateItemMetadata(params, fetchProjectBySlug)
}

export async function generateStaticParams () {
  return generateItemStaticParams(fetchProjects)
}

export default async function ProjectPage ({ params }: PageItemProps) {
  const [
    { slug },
    session
  ] = await Promise.all([
    params,
    auth()
  ])
  const [
    project,
    releases,
    events
  ] = await Promise.all([
    fetchProjectBySlug(slug, !!session?.user),
    fetchReleases(!!session?.user, slug),
    fetchEvents(!!session?.user, slug)
  ])
  if (!project) {
    redirect('/projects')
  }

  return (
    <ItemLayout item={project}>
      <Suspense fallback={<Loading />}>
        <ItemsTable
          path='releases'
          initialItems={releases}
        />
        <ItemsTable
          path='events'
          initialItems={events}
        />
      </Suspense>
    </ItemLayout>
  )
}
