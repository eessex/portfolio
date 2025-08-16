import { fetchReleases } from '@/lib/data'
import Loading from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '../../auth'
import ReleaseLists from './release-lists'

const title = 'Releases'
export const metadata: Metadata = { title }

export default async function ReleasesPage () {
  const session = await auth()
  const releases = await fetchReleases(!!session?.user)

  return (
    <div>
      <h1 className='p-4 visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading />}>
        <ReleaseLists releases={releases} />
      </Suspense>
    </div>
  )
}
