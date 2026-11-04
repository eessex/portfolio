import type { Metadata } from 'next'

import ListLayout from '@/app/(item-pages)/list-layout'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import { formattedItemType } from '@/ui/format/items'
import { ItemsTable } from '@/ui/items/items-table/items-table'

const path = PagePaths.releases
const description = 'Selected discography.'
const title = formattedItemType(path, false, true)

export const metadata: Metadata = { title, description }

export default async function ReleasesPage() {
  return (
    <ListLayout title={title} itemType={path}>
      <ReleasesList />
    </ListLayout>
  )
}

async function ReleasesList() {
  const releases = await fetchCachedReleasesFirstPage(false)

  return (
    <ItemsTable<ReleaseClient, FetchReleasesResult>
      itemType={path}
      initialItems={releases}
    />
  )
}
