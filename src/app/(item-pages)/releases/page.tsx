import type { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import { fetchReleases } from '@/lib/releases/data'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import type { PagePathType } from '@/lib/types'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'
import { formattedItemType } from '@/ui/util'

const path: PagePathType = 'releases'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title }

export default async function ReleasesPage () {
  const session = await auth()
  const releases = await fetchReleases(!!session?.user)

  return (
    <div>
      <h1 className='visually-hidden'>
        {title}
      </h1>

      <Suspense fallback={<Loading />}>
        <ItemsTable<ReleaseClient, FetchReleasesResult>
          path={path}
          initialItems={releases}
        />
      </Suspense>
    </div>
  )
}
