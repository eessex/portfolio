import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import ListLayout from '@/app/(item-pages)/list-layout'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import { siteIdentity } from '@/lib/projects/site-identity'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { ARTISTS_PATH, PagePaths } from '@/lib/schemas'
import { formattedItemType } from '@/ui/format/items'
import { ItemsTable } from '@/ui/items/items-table/items-table'

const path = PagePaths.projects
const description = 'Additional projects and collaborations.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function ProjectsPage() {
  // a label lists its roster at /artists instead; its other projects
  // stay on the /about carousel, and project pages stay at
  // /projects/<slug>
  if ((await siteIdentity()).kind === 'label') {
    redirect(`/${ARTISTS_PATH}`)
  }

  return (
    <ListLayout title={title} itemType={path}>
      <ProjectsList />
    </ListLayout>
  )
}

async function ProjectsList() {
  const projects = await fetchCachedProjectsFirstPage(false, {
    isDefaultExcluded: true
  })

  return (
    <ItemsTable<ProjectClient, FetchProjectsResult>
      itemType={path}
      initialItems={projects}
      isExpandedOnLoad
      isCategoryVisible
      searchParams={{ isDefaultExcluded: true }}
    />
  )
}
