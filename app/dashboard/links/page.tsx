import { deleteLink, editLink } from '@/lib/actions/links'
import { fetchLinks } from '@/lib/data/links'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Links'
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const links = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={links}
          itemType='link'
          editItem={editLink}
          deleteItem={deleteLink}
        />
      </Suspense>
    </DashboardLayout>
  )
}
