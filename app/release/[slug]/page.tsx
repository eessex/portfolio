import styles from '@/release/[slug]/release.module.scss'
import { fetchReleaseBySlug, fetchReleases } from '@/lib/data'
import { formattedDateTime } from '@/ui/util'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmbedCodes } from '@/ui/embed-codes/embed-codes'

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
  const releases = await fetchReleases()

  return releases.map((release) => ({
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [featuredImage, ...images] = release?.images || []
  const [featuredEmbed, ...embedCodes] = release?.embedCodes || []

  if (!release) {
    notFound()
  }

  const releaseCategory = () => {
    if (release.isCollaboration) {
      return 'Collaborative Release'
    } else if (release.isFeature) {
      return 'Featured on'
    } else if (release.isSingle) {
      return 'Single'
    } else if (release.isCompilation) {
      return 'Compilation'
    } else {
      return 'Release'
    }
  }

  return (
    <div>
      <article className={styles.release}>
        <header>
          <div className={styles.category}>
            <Link href='/releases'>{releaseCategory()}</Link>
          </div>
          <h1>{release.artist}: {release.title}</h1>
          <h2>
            {release.format}, {release.label}, {formattedDateTime(release.releaseDate, 'xxs')}
          </h2>
        </header>

        <section>
          {featuredEmbed && (
            <EmbedCodes embedCodes={[featuredEmbed]} />
          )}

          {featuredImage && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage.url} alt={featuredImage.caption} style={{ aspectRatio: featuredImage.aspect }} />
              <figcaption>{featuredImage.caption}</figcaption>
            </figure>
          )}

          {release.description && (
            <p style={{ whiteSpace: 'pre-line' }}>
              {release.description}
            </p>
          )}

          {release.links && (
            <ul className={styles.links}>
              {release.links.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target='_blank' rel='noreferrer'>
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!!embedCodes?.length && (
            <EmbedCodes embedCodes={embedCodes} />
          )}
        </section>
      </article>
    </div>
  )
}
