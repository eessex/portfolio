import type { Metadata } from 'next'
import { Suspense } from 'react'

import { deleteEmbedCode } from '@/lib/embed-codes/actions'
import { fetchEmbedCodes } from '@/lib/embed-codes/data'
import { EmbeddedItemTypes } from '@/lib/schemas'
import { camelToSentence } from '@/lib/strings'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'

const itemType = EmbeddedItemTypes.embedCodes
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function EmbedCodesPage() {
  const res = await fetchEmbedCodes()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/embed_codes'
          res={res}
          itemType={itemType}
          deleteItem={deleteEmbedCode}
        />
      </Suspense>
    </DashboardLayout>
  )
}
