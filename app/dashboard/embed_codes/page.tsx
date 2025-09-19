import { deleteEmbedCode, editEmbedCode } from '@/lib/embed-codes/actions'
import { fetchEmbedCodes } from '@/lib/embed-codes/data'
import { DashboardItems, EmbeddedItemKey } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const path: EmbeddedItemKey = 'embedCodes'

const title = `Dashboard: ${camelToSentence(path)}`
export const metadata: Metadata = { title }

export default async function EmbedCodesPage () {
  const embedCodes = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={embedCodes}
          itemType={path}
          editItem={editEmbedCode}
          deleteItem={deleteEmbedCode}
        />
      </Suspense>
    </DashboardLayout>
  )
}
