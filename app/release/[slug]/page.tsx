import styles from '@/release/[slug]/release.module.scss'
import { fetchReleaseBySlug, fetchReleases } from '@/lib/data'
import { formattedDateTime } from '@/ui/util'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
          {release.buyLink && (
            <a className={'button ' + styles['ticket-link']} href={release.buyLink} target='_blank' rel='noreferrer'>
              Bandcamp
            </a>
          )}
        </header>

        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={release.images[0].url} alt={release.images[0].caption} style={{ aspectRatio: release.images[0].aspect }} />
          <figcaption>{release.images[0].caption}</figcaption>
        </figure>

        <section>
          {release.description && (
            <p>{release.description}</p>
          )}
        </section>
      </article>
    </div>
  )
}
