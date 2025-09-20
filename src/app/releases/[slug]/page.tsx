import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@/api/auth/auth'
import styles from '@/app/releases/[slug]/release.module.scss'
import { fetchReleaseBySlug, fetchReleases } from '@/lib/releases/data'
import { DraftBadge } from '@/ui/draft-badge'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { FigureImage } from '@/ui/images/image-figure'
import { LinksList } from '@/ui/links/link-list'
import { combinePublishedEditions, filteredLinksByPress, formattedDateTime } from '@/ui/util'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata (
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const release = await fetchReleaseBySlug(slug)

  const images = release?.coverImage
    ? [{
        url: release.coverImage.url,
        width: 1200,
        height: 1200 * release.coverImage.aspect,
        alt: release.coverImage.caption
      }]
    : []

  const meta: Metadata = {
    title: release && `${release.artist}: ${release.title}`,
    openGraph: { images }
  }

  return meta
}

export async function generateStaticParams () {
  const releases = await fetchReleases(true)
  const allReleases = Object.values(releases).flat()

  return allReleases.map((release) => ({
    slug: release.slug
  }))
}

export default async function ReleasesPage ({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const release = await fetchReleaseBySlug(slug, !!session?.user)

  if (!release) {
    notFound()
  }

  const releaseCategory = () => {
    switch (release.type) {
      case 'compilation':
        return 'Compilation'
      case 'collaborative_release':
        return 'Collaborative Release'
      case 'feature':
        return 'Featured On'
      case 'single':
        return 'Single'
      default:
        return 'Release'
    }
  }

  return (
    <div>
      <article className={styles.release}>
        <header>
          <div className={styles.category}>
            <NextLink href='/releases'>{releaseCategory()}</NextLink>
            {!release.isPublished && <DraftBadge />}
          </div>
          <h1>{release.artist}: {release.title}</h1>

          {release.publishedEditions && (
            <div className={styles.editions}>
              <h2 className='visually-hidden'>Published by:</h2>
              <ul>
                {combinePublishedEditions(release.publishedEditions).map((edition, i) => (
                  <li key={`${edition.publisher}-${edition.publishDate}-${i}`}>
                    {edition.format}, {edition.publisher}, {formattedDateTime(edition.publishDate, 'xs')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <section>
          {release.featuredEmbedCode && (
            <EmbedCodes embedCodes={[release.featuredEmbedCode]} />
          )}
          {release.coverImage && (
            <FigureImage image={release.coverImage} isPriority />
          )}

          {release.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {release.description}
            </p>
          )}

          {release.links && !!filteredLinksByPress(release.links)[0].length && (
            <LinksList links={filteredLinksByPress(release.links)[0]} />
          )}

          {release.links && !!filteredLinksByPress(release.links)[1].length && (
            <LinksList links={filteredLinksByPress(release.links)[1]} />
          )}

          {!!release.embedCodes?.length && (
            <EmbedCodes embedCodes={release.embedCodes} />
          )}
        </section>
      </article>
    </div>
  )
}
