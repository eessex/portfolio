import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchEmbedCodes } from '@/lib/embed-codes/cached'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.embedCodes
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function EmbedCodesPage() {
  const res = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <ItemsTable itemType={itemType} initialItems={res} />
      </Suspense>
    </DashboardLayout>
  )
}
