import type { ReleaseClient } from '@/lib/releases/types'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import { combinePublishedEditions, formattedDateTime, releaseUrl } from '@/ui/util'
import Link from 'next/link'

export function ReleaseListItem ({
  release,
  index: _index,
}: {
  release: ReleaseClient
  index: number
}) {
  return (
    <article>
      <Link href={releaseUrl(release.slug)}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(release.releaseDate, 'xxs')}
          </div>

          <div className='font-bold md:font-normal'>
            {release.artist}: {release.title} {!release.isPublished && <DraftBadge />}
          </div>
        </div>

        {release.publishedEditions && (
          <div className={styles.contentRight}>
            <h4 className='visually-hidden'>Published by:</h4>
            <ul className={styles.editions}>
              {combinePublishedEditions(release.publishedEditions).map((edition, i) => (
                <li key={`${edition.publisher}-${edition.publishDate}-${i}`}>
                  {edition.format}, {edition.publisher}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Link>
    </article>
  )
}
