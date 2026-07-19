import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchProjects } from '@/lib/projects/data'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.projects
const description = 'Additional projects and collaborations.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default function ProjectsPage() {
  return (
    <ListLayout title={title}>
      <ProjectsList />
    </ListLayout>
  )
}

async function ProjectsList() {
  const projects = await fetchProjects(await isAuthed())

  return (
    <ItemsTable<ProjectClient, FetchProjectsResult>
      path={path}
      initialItems={projects}
      isExpandedOnLoad
      isCategoryVisible
    />
  )
}
