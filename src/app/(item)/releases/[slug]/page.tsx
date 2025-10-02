import ItemLayout, {
  generateItemMetadata,
  generateItemStaticParams,
  type ItemLayoutProps
} from '@/app/(item)/item-layout'
import {
  fetchReleaseBySlug,
  fetchReleases
} from '@/lib/releases/data'
import { type PagePathType } from '@/lib/types'

const path: PagePathType = 'releases'

export async function generateMetadata ({ params }: ItemLayoutProps) {
  return await generateItemMetadata(params, path, fetchReleaseBySlug)
}

export async function generateStaticParams () {
  return await generateItemStaticParams(fetchReleases)
}

export default async function ReleasePage ({ params }: ItemLayoutProps) {
  const { slug } = await params

  return (
    <ItemLayout
      itemType='releases'
      slug={slug}
      fetchFn={fetchReleaseBySlug}
    />
  )
}
