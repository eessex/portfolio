import { fetchReleases, type FetchReleasesResult } from '@/lib/data'
import type { ReleaseClient } from '@/lib/definitions'
import { ItemsIndex } from '@/ui/items/items-index'
import { Loading } from '@/ui/loading'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '../../auth'

const title = 'Releases'
export const metadata: Metadata = { title }

export default async function ReleasesPage () {
  const session = await auth()
  const releases = await fetchReleases(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading className='p-4 mt-2' />}>
        <ItemsIndex<ReleaseClient, FetchReleasesResult>
          pageType='release'
          items={releases}
        />
      </Suspense>
    </div>
  )
}
