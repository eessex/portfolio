import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { isAuthed } from '@/lib/auth/guard'
import { fetchReleases } from '@/lib/releases/data'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'
import { formattedItemType } from '@/ui/util'

const path = PagePaths.releases
const description = 'Selected discography.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default function ReleasesPage() {
  return (
    <ListLayout title={title}>
      <ReleasesList />
    </ListLayout>
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
