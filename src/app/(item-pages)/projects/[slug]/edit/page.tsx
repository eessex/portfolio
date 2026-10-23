import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { fetchProjectById } from '@/lib/projects/data'
import { ABOUT_PATH, PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { Loading } from '@/ui/loading'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'Edit Project'
export const metadata: Metadata = { title }

export default function EditProjectPage({ params }: PageItemProps) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <Suspense fallback={<Loading />}>
        <EditProject params={params} />
      </Suspense>
    </article>
  )
}

async function EditProject({ params }: PageItemProps) {
  const { slug } = await params
  const id = await resolveEditItemId(PagePaths.projects, slug)
  // uncached: saving a stale form detaches child ids added since
  const project = await fetchProjectById(id, true)

  if (!project) return notFound()
  if (project.isDefaultProject) redirect(`/${ABOUT_PATH}/edit`)

  return <EditProjectForm project={project} />
}
