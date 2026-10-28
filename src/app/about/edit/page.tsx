import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'
import { fetchDefaultProject } from '@/lib/projects/data'
import { Loading } from '@/ui/loading'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'Edit: About'
export const metadata: Metadata = { title }

export default function EditAboutPage() {
  return (
    <EditPageLayout title={title}>
      <Suspense fallback={<Loading />}>
        <EditDefaultProject />
      </Suspense>
    </EditPageLayout>
  )
}

/**
 * Edits the default project, or creates it when none exists yet (a
 * fresh instance). The route is admin-only (`auth.config.ts`), so the
 * authed fetch includes an unpublished default. Uncached: a stale form
 * would save stale child ids and detach anything added since.
 */
async function EditDefaultProject() {
  await connection()
  const project = await fetchDefaultProject(true)

  return <EditProjectForm project={project} isDefaultProject />
}
