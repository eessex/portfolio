import type { Metadata } from 'next'
import { Suspense } from 'react'

import { isAuthed } from '@/lib/auth/guard'
import { fetchReleases } from '@/lib/releases/data'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { Loading } from '@/ui/loading'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.releases
const description = 'Selected discography.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default function ReleasesPage() {
  return (
    <div>
      <h1 className='visually-hidden'>{title}</h1>

      <Suspense fallback={<Loading />}>
        <ReleasesList />
      </Suspense>
    </div>
  )
}

async function ReleasesList() {
  const releases = await fetchReleases(await isAuthed())

  return (
    <ItemsTable<ReleaseClient, FetchReleasesResult>
      path={path}
      initialItems={releases}
    />
  )
}
