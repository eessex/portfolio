import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { auth } from '@/api/auth'
import ItemLayout from '@/app/(item)/item-layout'
import {
  fetchReleaseBySlug, fetchReleases
} from '@/lib/releases/data'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata ({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return notFound()

  const session = await auth()
  const release = await fetchReleaseBySlug(slug, !!session?.user)
  const images = release?.coverImage
    ? [{
        url: release.coverImage.url,
        width: 1200,
        height: 1200 * release.coverImage.aspect,
        alt: release.coverImage.alt || release.coverImage.caption || ''
      }]
    : []

  const meta: Metadata = {
    title: `Release: ${release?.title || 'Not found'}`,
    openGraph: { images }
  }

  return meta
}

export async function generateStaticParams () {
  const releases = await fetchReleases()

  return Object.values(releases).map((release) => ({ slug: release.slug }))
}

export default async function ReleasePage ({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <ItemLayout
      itemType='releases'
      slug={slug}
      fetchFn={fetchReleaseBySlug}
    >
      <div>Related Content</div>
      {/* {moreEvents.length > 0 && (
        <ItemsList
          items={moreEvents}
          isTextOnly
          title='Upcoming Events'
        />
      )} */}
    </ItemLayout>
  )
}
