import { deleteImage, editImage } from '@/lib/images/actions'
import { fetchImages } from '@/lib/images/data'
import { DashboardItems, EmbeddedItemKey } from '@/ui/dashboard/dashboard-items'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const path: EmbeddedItemKey = 'images'

const title = `Dashboard: ${camelToSentence(path)}`
export const metadata: Metadata = { title }

export default async function ImagesPage () {
  const images = await fetchImages()

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <DashboardItems
          items={images}
          itemType={path}
          editItem={editImage}
          deleteItem={deleteImage}
        />
      </Suspense>
    </DashboardLayout>
  )
}
