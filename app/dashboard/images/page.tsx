import { fetchImages } from '@/lib/data/images'
import { Dashboard } from '@/ui/dashboard/dashboard'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'

const title = 'Dashboard: Images'
export const metadata: Metadata = { title }

export default async function ImagesPage () {
  const images = await fetchImages()

  return (
    <div>
      <h1 className='p-4'>
        {title}
      </h1>

      <div className='p-4'>
        <Suspense fallback={<Loading />}>
          <Dashboard
            items={images}
            itemType='image'
            editItem={async (_i) => undefined}
            deleteItem={async (_i) => undefined}
          />
        </Suspense>
      </div>
    </div>
  )
}
