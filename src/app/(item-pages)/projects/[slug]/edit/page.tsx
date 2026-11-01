import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import {
  editItemTitle,
  generateEditItemMetadata
} from '@/app/(item-pages)/edit-item-metadata'
import { resolveEditItemId } from '@/app/(item-pages)/resolve-page-item'
import { fetchCachedProjectById } from '@/lib/projects/cached'
import { fetchProjectById } from '@/lib/projects/data'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'
import { FormPageLayout } from '@/ui/form/form-page-layout'
import { Loading } from '@/ui/loading'
import { EditProjectForm } from '@/ui/projects/edit-project-form'
import { itemEditUrl } from '@/ui/routes'

const title = 'Edit Project'

export async function generateMetadata({ params }: PageItemProps) {
  return generateEditItemMetadata(
    params,
    PagePaths.projects,
    fetchCachedProjectById,
    title
  )
}

export default function EditProjectPage({ params }: PageItemProps) {
  return (
    <Suspense
      fallback={
        <FormPageLayout title={title}>
          <Loading />
        </FormPageLayout>
      }
    >
      <EditProject params={params} />
    </Suspense>
  )
}

async function EditProject({ params }: PageItemProps) {
  const { slug } = await params
  const id = await resolveEditItemId(PagePaths.projects, slug)
  // uncached: saving a stale form detaches child ids added since
  const project = await fetchProjectById(id, true)

  if (!project) return notFound()
  if (project.isDefaultProject) redirect(itemEditUrl(project))

  return (
    <FormPageLayout title={editItemTitle(title, project)}>
      <EditProjectForm project={project} />
    </FormPageLayout>
  )
}
