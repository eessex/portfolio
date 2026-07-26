import type { Metadata } from 'next'
import { Suspense } from 'react'

import { deletePublishedEdition } from '@/lib/published-editions/actions'
import { fetchPublishedEditions } from '@/lib/published-editions/data'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.publishedEditions
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function PublishedEditionsPage() {
  const res = await fetchPublishedEditions()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/published_editions'
          res={res}
          itemType={itemType}
          deleteItem={deletePublishedEdition}
        />
      </Suspense>
    </DashboardLayout>
  )
}
