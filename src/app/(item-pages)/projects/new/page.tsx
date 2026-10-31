import type { Metadata } from 'next'

import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'New Project'
export const metadata: Metadata = { title }

export default function NewProjectPage() {
  return (
    <EditPageLayout title={title}>
      <EditProjectForm />
    </EditPageLayout>
  )
}
