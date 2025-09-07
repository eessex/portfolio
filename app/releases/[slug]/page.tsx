import { fetchReleaseBySlug, fetchReleases } from '@/lib/data'
import type { Link as _Link } from '@/lib/links/types'
import styles from '@/releases/[slug]/release.module.scss'
import { DraftBadge } from '@/ui/draft-badge'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'
import { FigureImage } from '@/ui/images/image-figure'
import { LinksList } from '@/ui/links/link-list'
import { filteredLinksByPress, formattedDateTime } from '@/ui/util'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '../../../auth'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata (
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const release = await fetchReleaseBySlug(slug)

  const images = release?.images[0]
    ? [{
        url: release.images[0].url,
        width: 1200,
        height: 1200 * release.images[0].aspect,
        alt: release.images[0].caption,
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
    slug: release.slug,
  }))
}

export default async function ReleasesPage ({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const release = await fetchReleaseBySlug(slug)
  const session = await auth()

  if (!release || (!release.isPublished && !session?.user)) {
    notFound()
  }

  const [featuredImage, ..._images] = release?.images || []
  const [featuredEmbed, ...embedCodes] = release?.embedCodes || []

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
            <Link href='/releases'>{releaseCategory()}</Link>
            {!release.isPublished && <DraftBadge />}
          </div>
          <h1>{release.artist}: {release.title}</h1>
          <h2>
            {/* {release.format}, {release.label},  */}
            {formattedDateTime(release.releaseDate, 'xxs')}
          </h2>
        </header>

        <section>
          {featuredEmbed && (
            <EmbedCodes embedCodes={[featuredEmbed]} />
          )}

          <FigureImage image={featuredImage} />

          {release.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {release.description}
            </p>
          )}

          {!!filteredLinksByPress(release.links)[0].length && (
            <LinksList links={filteredLinksByPress(release.links)[0]} />
          )}

          {!!filteredLinksByPress(release.links)[1].length && (
            <LinksList links={filteredLinksByPress(release.links)[1]} />
          )}

          {!!embedCodes?.length && (
            <EmbedCodes embedCodes={embedCodes} />
          )}
        </section>
      </article>
    </div>
  )
}
