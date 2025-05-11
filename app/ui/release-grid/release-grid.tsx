import { ReleaseClient } from '@/lib/definitions'
import Link from 'next/link'
import ReleaseGridItem from '@/ui/release-grid/release-grid-item'
import styles from '@/ui/release-grid/release-grid.module.scss'

export default function ReleaseGrid ({
  releases,
  title
}: {
  releases: ReleaseClient[];
  title?: string;
}) {
  return (
    <section className='px-4 pt-4 pb-8'>
      <h2 className='py-2'>
        {title || (
          <Link href='/releases'>Releases</Link>
        )}
      </h2>

      <ul className={styles.grid}>
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
