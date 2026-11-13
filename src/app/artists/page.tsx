import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import ListLayout from '@/app/(item-pages)/list-layout'
import { fetchCachedProjectsFirstPage } from '@/lib/projects/cached'
import { ARTISTS_LABEL } from '@/lib/projects/labels'
import { artistProjectTypes } from '@/lib/projects/schemas'
import { siteIdentity } from '@/lib/projects/site-identity'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import { PagePaths } from '@/lib/schemas'
import { ItemsTable } from '@/ui/items/items-table/items-table'

const title = ARTISTS_LABEL
const description = 'Artists on the label.'

export const metadata: Metadata = { title, description }

/** A label site's roster: its artist projects, by name */
const rosterOptions = {
  isDefaultExcluded: true,
  types: artistProjectTypes,
  orderBy: 'name'
} as const

export default async function ArtistsPage() {
  // only a label has a roster; other sites list every project
  if ((await siteIdentity()).kind !== 'label') {
    redirect(`/${PagePaths.projects}`)
  }

  return (
    <ListLayout title={title} itemType={PagePaths.projects}>
      <ArtistsList />
    </ListLayout>
  )
}

async function ArtistsList() {
  const artists = await fetchCachedProjectsFirstPage(
    false,
    rosterOptions
  )

  return (
    <ItemsTable<ProjectClient, FetchProjectsResult>
      itemType={PagePaths.projects}
      initialItems={artists}
      isExpandedOnLoad
      isCategoryVisible
      // a roster artist's dates have no clear public meaning
      isDateHidden
      searchParams={{
        ...rosterOptions,
        types: rosterOptions.types.join(',')
      }}
    />
  )
}
