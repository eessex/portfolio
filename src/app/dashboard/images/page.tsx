import type { Metadata } from 'next'
import { Suspense } from 'react'

import { deleteImage } from '@/lib/images/actions'
import { fetchImages } from '@/lib/images/data'
import type { EmbeddedItemType } from '@/lib/types'
import { DashboardItems } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

const itemType: EmbeddedItemType = 'images'
const title = `Dashboard: ${camelToSentence(itemType)}`
export const metadata: Metadata = { title }

export default async function ImagesPage () {
  const res = await fetchImages()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <DashboardItems
          apiEndpoint='/api/images'
          res={res}
          itemType={itemType}
          deleteItem={deleteImage}
        />
      </Suspense>
    </DashboardLayout>
  )
}
