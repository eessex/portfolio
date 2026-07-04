import type { Metadata } from 'next'
import { Suspense } from 'react'

import { deleteLink } from '@/lib/links/actions'
import { fetchLinks } from '@/lib/links/data'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const itemType = EmbeddedItemTypes.links
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function LinksPage() {
  const res = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/links'
          res={res}
          itemType={itemType}
          deleteItem={deleteLink}
        />
      </Suspense>
    </DashboardLayout>
  )
}
