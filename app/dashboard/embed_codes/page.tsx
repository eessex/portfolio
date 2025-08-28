import { fetchEmbedCodes } from '@/lib/data/embed-codes'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EmbedCodeDashboard } from '@/ui/embed-codes/embed-code-dashboard'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed codes'
export const metadata: Metadata = { title }

export default async function EmbedCodesPage () {
  const embedCodes = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <EmbedCodeDashboard embedCodes={embedCodes} />
      </Suspense>
    </DashboardLayout>
  )
}
