import { deleteEmbedCode, editEmbedCode } from '@/lib/actions/embed-codes'
import { fetchEmbedCodes } from '@/lib/data/embed-codes'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed codes'
export const metadata: Metadata = { title }

export default async function EmbedCodesPage () {
  const embedCodes = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title} itemType='embedCode'>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          items={embedCodes}
          itemType='embedCode'
          editItem={editEmbedCode}
          deleteItem={deleteEmbedCode}
        />
      </Suspense>
    </DashboardLayout>
  )
}
