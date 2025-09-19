import { deleteLink, editLink } from '@/lib/links/actions'
import { fetchLinks } from '@/lib/links/data'
import type { EmbeddedItemType } from '@/lib/types'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const itemType: EmbeddedItemType = 'links'
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const links = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={links}
          itemType={itemType}
          editItem={editLink}
          deleteItem={deleteLink}
        />
      </Suspense>
    </DashboardLayout>
  )
}
