import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import { fetchCachedProjectById } from '@/lib/projects/cached'
import { fetchProjectsRaw } from '@/lib/projects/data'
import type { ProjectClient } from '@/lib/projects/types'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { ItemsTable } from '@/ui/items/items-table/items-table'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(
    params,
    PagePaths.projects,
    fetchCachedProjectById
  )
}

export async function generateStaticParams() {
  // the default project only redirects to /about
  return generateItemStaticParams(() =>
    fetchProjectsRaw(false, undefined, undefined, {
      isDefaultExcluded: true
    })
  )
}

export default async function ProjectPage({ params }: PageItemProps) {
  const { slug } = await params
  const resolved = await resolveSlug(PagePaths.projects, slug)

  if (!resolved) {
    redirect(`/${PagePaths.projects}`)
  }

  if (resolved.isRedirect) {
    redirect(`/${PagePaths.projects}/${resolved.slug}`)
  }

  const project = await fetchCachedProjectById(resolved.id, false)

  if (project?.isDefaultProject) redirect('/about')

  if (project) {
    return <ProjectDetail project={project} isAuthed={false} />
  }

  const authed = await isAuthed()
  const draft = await fetchCachedProjectById(resolved.id, authed)

  if (!draft) {
    redirect(`/${PagePaths.projects}`)
  }

  if (draft.isDefaultProject) redirect('/about')

  return <ProjectDetail project={draft} isAuthed={authed} />
}

async function ProjectDetail({
  project,
  isAuthed: authed
}: {
  project: ProjectClient
  isAuthed: boolean
}) {
  const [releases, events] = await Promise.all([
    fetchCachedReleasesFirstPage(authed, project.id),
    fetchCachedEventsFirstPage(authed, project.id)
  ])

  return (
    <ItemLayout item={project}>
      <ItemsTable
        itemType={PagePaths.releases}
        initialItems={releases}
        projectId={project.id}
      />
      <ItemsTable
        itemType={PagePaths.events}
        initialItems={events}
        projectId={project.id}
      />
    </ItemLayout>
  )
}
