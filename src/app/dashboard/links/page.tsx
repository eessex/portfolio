import type { Metadata } from 'next'
import { Suspense } from 'react'

import {
  deleteLink,
  editLink
} from '@/lib/links/actions'
import {
  fetchLinkByUrl,
  fetchLinks
} from '@/lib/links/data'
import type { EmbeddedItemType } from '@/lib/types'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const itemType: EmbeddedItemType = 'links'
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const res = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          apiEndpoint='/api/links'
          res={res}
          itemType={itemType}
          editItem={editLink}
          deleteItem={deleteLink}
          fetchMaybeExistingItem={fetchLinkByUrl}
        />
      </Suspense>
    </DashboardLayout>
  )
}
