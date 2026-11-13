import { redirect } from 'next/navigation'

import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { resolvePageItem } from '@/app/(item-pages)/resolve-page-item'
import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import { fetchCachedProjectById } from '@/lib/projects/cached'
import { fetchProjectsRaw } from '@/lib/projects/data'
import { activeHousePublisherId } from '@/lib/projects/site-identity'
import type { ProjectClient } from '@/lib/projects/types'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { ABOUT_PATH, PagePaths } from '@/lib/schemas'
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
  const { item, isAuthed } = await resolvePageItem(
    PagePaths.projects,
    slug,
    fetchCachedProjectById
  )

  if (item.isDefaultProject) redirect(`/${ABOUT_PATH}`)

  return <ProjectDetail project={item} isAuthed={isAuthed} />
}

async function ProjectDetail({
  project,
  isAuthed
}: {
  project: ProjectClient
  isAuthed: boolean
}) {
  const [releases, events, hiddenPublisherId] = await Promise.all([
    fetchCachedReleasesFirstPage(isAuthed, project.id),
    fetchCachedEventsFirstPage(isAuthed, project.id),
    activeHousePublisherId()
  ])

  return (
    <ItemLayout item={project}>
      <ItemsTable
        itemType={PagePaths.releases}
        initialItems={releases}
        projectId={project.id}
        hiddenPublisherId={hiddenPublisherId}
      />
      <ItemsTable
        itemType={PagePaths.events}
        initialItems={events}
        projectId={project.id}
      />
    </ItemLayout>
  )
}
