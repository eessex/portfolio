import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams
} from '@/app/(item-pages)/item-layout'
import { resolvePageItem } from '@/app/(item-pages)/resolve-page-item'
import { fetchCachedReleaseById } from '@/lib/releases/cached'
import { fetchReleasesRaw } from '@/lib/releases/data'
import { PagePaths } from '@/lib/schemas'
import type { PageItemProps } from '@/lib/types'

export async function generateMetadata({ params }: PageItemProps) {
  return generateItemMetadata(
    params,
    PagePaths.releases,
    fetchCachedReleaseById
  )
}

export async function generateStaticParams() {
  return generateItemStaticParams(fetchReleasesRaw)
}

export default async function ReleasePage({ params }: PageItemProps) {
  const { slug } = await params
  const { item } = await resolvePageItem(
    PagePaths.releases,
    slug,
    fetchCachedReleaseById
  )

  return <ItemLayout item={item} />
}
