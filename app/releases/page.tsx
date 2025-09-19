import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchReleases } from '@/lib/releases/data'
import type { FetchReleasesResult, ReleaseClient } from '@/lib/releases/types'
import type { PagePathType } from '@/lib/types'
import { ItemsIndex } from '@/ui/items/items-index'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

import { auth } from '../../auth'

const path: PagePathType = 'releases'
const title = camelToSentence(path)

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
          pageType={path}
          items={releases}
          isExpandedOnLoad
        />
      </Suspense>
    </div>
  )
}
