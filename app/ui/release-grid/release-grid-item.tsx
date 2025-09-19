import type { ReleaseClient } from '@/lib/releases/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import { combinePublishedEditions, formattedDateTime, releaseUrl } from '@/ui/util'
import NextImage from 'next/image'
import Link from 'next/link'

export function ReleaseGridItem ({
  release,
  index
}: {
  release: ReleaseClient
  index: number
}) {
  return (
    <article>
      {release.coverImage && (
        <figure style={{ aspectRatio: release.coverImage.aspect }}>
          <Link href={releaseUrl(release.slug)}>
            <NextImage
              src={release.coverImage.url}
              alt={release.coverImage.alt || release.coverImage.caption || ''}
              title={release.coverImage.caption || release.coverImage.alt || undefined}
              width={500 * release.coverImage.aspect}
              height={500}
              loading={index > 8 ? 'lazy' : undefined}
              priority={index < 8}
            />
          </Link>
        </figure>
      )}
      <section>
        <Link href={releaseUrl(release.slug)}>
          <h3>
            {release.artist}: {release.title}
          </h3>

          {!release.isPublished && <DraftBadge />}

          {release.publishedEditions && (
            <div className={styles.editions}>
              <h4 className='visually-hidden'>Published by:</h4>
              <ul>
                {combinePublishedEditions(release.publishedEditions).map((edition, id) => (
                  <li key={`${edition.publisher}-${edition.publishDate}-${id}`}>
                    {edition.format}, {edition.publisher}, {formattedDateTime(edition.publishDate, 'xxs')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Link>
      </section>
    </article>
  )
}
