import { deleteEmbedCode, editEmbedCode } from '@/lib/embed-codes/actions'
import { fetchEmbedCodes } from '@/lib/embed-codes/data'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Embed codes'
export const metadata: Metadata = { title }

export default async function EmbedCodesPage () {
  const embedCodes = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
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
