import { deleteLink, editLink } from '@/lib/links/actions'
import { fetchLinks } from '@/lib/links/data'
import { DashboardItems, EmbeddedItemKey } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const path: EmbeddedItemKey = 'links'

const title = `Dashboard: ${camelToSentence(path)}`
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const links = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={links}
          itemType={path}
          editItem={editLink}
          deleteItem={deleteLink}
        />
      </Suspense>
    </DashboardLayout>
  )
}
