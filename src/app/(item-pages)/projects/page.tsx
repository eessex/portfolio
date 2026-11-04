import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import { formattedItemType } from '@/ui/format/items'
import { ItemsTable } from '@/ui/items/items-table/items-table'

const path = PagePaths.projects
const description = 'Additional projects and collaborations.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function ProjectsPage() {
  return (
    <ListLayout title={title} itemType={path}>
      <ProjectsList />
    </ListLayout>
  )
}

async function ProjectsList() {
  const projects = await fetchCachedProjectsFirstPage(false, true)

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
