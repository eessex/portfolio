import { ReleaseClient } from '@/lib/definitions'
import ReleaseListItem from '@/ui/release-list/release-list-item'
import styles from '@/ui/release-list/release-list.module.scss'

export default function ReleaseGrid ({
  releases,
  title
}: {
  releases: ReleaseClient[];
  title: string;
}) {
  return (
    <section>
      <h2 className='px-4 py-3'>{title}</h2>

      <ul>
        {releases.map((release, index) => (
          <li key={release.id} className={styles.li}>
            <ReleaseListItem release={release} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
