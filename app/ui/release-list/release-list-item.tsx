import type { ReleaseClient } from '@/lib/definitions'
import { DraftBadge } from '@/ui/draft-badge'
import styles from '@/ui/items/items.module.scss'
import { formattedDateTime, releaseUrl } from '@/ui/util'
import Link from 'next/link'

export function ReleaseListItem ({
  release,
  index: _index,
}: {
  release: ReleaseClient;
  index: number;
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

        <div className={styles.contentRight}>
          {release.format}, {release.label}
        </div>
      </Link>
    </article>
  )
}
