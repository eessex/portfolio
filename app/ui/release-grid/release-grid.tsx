import { ReleaseClient } from '@/lib/definitions'
import Link from 'next/link'
import ReleaseGridItem from '@/ui/release-grid/release-grid-item'
import { useId } from 'react'
import styles from '@/ui/items-grid/items-grid.module.scss'

export default function ReleaseGrid ({
  releases,
  title
}: {
  releases: ReleaseClient[];
  title?: string;
}) {
  const id = useId()

  return (
    <section aria-labelledby={id} className={styles['items-grid']}>
      <h2 id={id}>
        {title || (
          <Link href='/releases'>Releases</Link>
        )}
      </h2>

      <ul>
        {releases.map((release, index) => (
          <li key={`${release.id}-${index}`}>
            <ReleaseGridItem
              release={release}
              index={index}
              key={index}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
