import { ReleaseClient } from '@/lib/definitions'
import ReleaseListItem from '@/ui/release-list/release-list-item'
import styles from '@/ui/items-list/items-list.module.scss'
import { useId } from 'react'

export default function ReleaseGrid ({
  releases,
  title
}: {
  releases: ReleaseClient[];
  title: string;
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <h2 id={id}>{title}</h2>

      <ul>
        {releases.map((release, index) => (
          <li key={release.id}>
            <ReleaseListItem release={release} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
