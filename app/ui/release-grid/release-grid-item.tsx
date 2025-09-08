import type { ReleaseClient } from '@/lib/releases/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import { combinePublishedEditions, formattedDateTime, releaseUrl } from '@/ui/util'
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={release.coverImage.url}
              alt={release.coverImage.caption || `Cover artwork for ${release.title}`}
              style={{ aspectRatio: release.coverImage.aspect }}
              loading={index > 8 ? 'lazy' : undefined}
              title={release.coverImage.caption || undefined}
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
                    {edition.format}, {edition.publisher}, {formattedDateTime(edition.publishDate, 'xs')}
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
