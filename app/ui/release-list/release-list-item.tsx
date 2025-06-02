import { ReleaseClient } from '@/lib/definitions'
import styles from '@/ui/release-list/release-list.module.scss'
import { formattedDateTime } from '@/ui/util'
import Link from 'next/link'

export default function ReleaseListItem ({
  release,
  index: _index,
}: {
  release: ReleaseClient;
  index: number;
}) {
  return (
    <article>
      <Link href={`/release/${release.slug}`}>
        <div className={styles.contentLeft}>
          <div>
            {formattedDateTime(release.releaseDate, 'xxs')}
          </div>

          <div className='font-bold md:font-normal'>
            {release.artist}: {release.title}
          </div>
        </div>

        <div className={styles.contentRight}>
          {release.format}, {release.label}
        </div>
      </Link>
    </article>
  )
}
