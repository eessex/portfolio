import { fetchLinks } from '@/lib/data/links'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { LinksDashboard } from '@/ui/links/links-dashboard'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Links'
export const metadata: Metadata = { title }

export default async function LinksPage () {
  const links = await fetchLinks()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <LinksDashboard links={links} />
      </Suspense>
    </DashboardLayout>
  )
}
