import type { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/api/auth'
import { fetchReleases } from '@/lib/releases/data'
import type { PagePathType } from '@/lib/types'
import { ItemsTable } from '@/ui/items-table/items-table'
import { Loading } from '@/ui/loading'
import { camelToSentence } from '@/ui/util'

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
        <ItemsTable
          path={path}
          items={[releases]}
          isExpandedOnLoad
        />
      </Suspense>
    </div>
  )
}
