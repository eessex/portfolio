import type { Metadata } from 'next'

import { EditPageLayout } from '@/app/(item-pages)/edit-page-layout'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'New Release'
export const metadata: Metadata = { title }

export default function NewReleasePage() {
  return (
    <EditPageLayout title={title}>
      <EditReleaseForm />
    </EditPageLayout>
  )
}
