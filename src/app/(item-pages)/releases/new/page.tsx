import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchActiveHousePublisher } from '@/lib/projects/site-identity'
import { FormPageLayout } from '@/ui/form/form-page-layout'
import { Loading } from '@/ui/loading'
import { EditReleaseForm } from '@/ui/releases/edit-release-form'

const title = 'New Release'
export const metadata: Metadata = { title }

export default function NewReleasePage() {
  return (
    <FormPageLayout title={title}>
      <Suspense fallback={<Loading />}>
        <NewRelease />
      </Suspense>
    </FormPageLayout>
  )
}

async function NewRelease() {
  const housePublisher = await fetchActiveHousePublisher()
  return <EditReleaseForm housePublisher={housePublisher} />
}
