import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchPublishers } from '@/lib/publishers/data'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.publishers
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function PublishersPage() {
  const res = await fetchPublishers()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <ItemsTable itemType={itemType} initialItems={res} />
      </Suspense>
    </DashboardLayout>
  )
}
