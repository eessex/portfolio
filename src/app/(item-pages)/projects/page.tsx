import type { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/auth'
import { fetchProjects } from '@/lib/projects/data'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.projects
const description = 'Additional projects and collaborations.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function ProjectsPage() {
  const session = await auth()
  const projects = await fetchProjects(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>{title}</h1>

      <Suspense fallback={<Loading />}>
        <ItemsTable<ProjectClient, FetchProjectsResult>
          path={path}
          initialItems={projects}
          isExpandedOnLoad
          isCategoryVisible
        />
      </Suspense>
    </div>
  )
}
