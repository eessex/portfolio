import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isAuthed } from '@/lib/auth/guard'
import { fetchCachedProjectById } from '@/lib/projects/cached'
import { PagePaths } from '@/lib/schemas'
import { resolveSlug } from '@/lib/slug/data'
import type { PageItemProps } from '@/lib/types'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'Edit Project'
export const metadata: Metadata = { title }

export default async function EditProjectPage({
  params
}: PageItemProps) {
  const { slug } = await params
  const resolved = await resolveSlug(PagePaths.projects, slug)
  const authed = await isAuthed()
  const project =
    resolved && (await fetchCachedProjectById(resolved.id, authed))

  if (!project) return notFound()

  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>

      <EditProjectForm project={project} />
    </article>
  )
}
