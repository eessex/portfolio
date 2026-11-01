import type { Metadata } from 'next'

import { FormPageLayout } from '@/ui/form/form-page-layout'
import { EditProjectForm } from '@/ui/projects/edit-project-form'

const title = 'New Project'
export const metadata: Metadata = { title }

export default function NewProjectPage() {
  return (
    <FormPageLayout title={title}>
      <EditProjectForm />
    </FormPageLayout>
  )
}
