import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchLinks } from '@/lib/links/cached'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.links
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function LinksPage() {
  const res = await fetchLinks()

  return (
    <DashboardLayout title={title} itemType={itemType}>
      <Suspense fallback={<Loading />}>
        <ItemsTable itemType={itemType} initialItems={res} />
      </Suspense>
    </DashboardLayout>
  )
}
