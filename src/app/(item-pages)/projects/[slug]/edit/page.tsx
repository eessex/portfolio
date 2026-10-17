import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import { isAuthed } from '@/lib/auth/guard'
import { fetchProjectById } from '@/lib/projects/data'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
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
  const resolved = await resolveSlug(PagePaths.projects, slug)
  const authed = await isAuthed()
  // uncached: saving a stale form detaches child ids added since
  const project =
    resolved && (await fetchProjectById(resolved.id, authed))

  if (!project) return notFound()
  if (project.isDefaultProject) redirect('/about/edit')

  return <EditProjectForm project={project} />
}
