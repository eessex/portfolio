import type { Metadata } from 'next'

import { FormPageLayout } from '@/ui/form/form-page-layout'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'New Release'
export const metadata: Metadata = { title }

export default function NewReleasePage() {
  return (
    <FormPageLayout title={title}>
      <EditReleaseForm />
    </FormPageLayout>
  )
}
