import type { ReleaseClient } from '@/lib/definitions'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import styles from '@/ui/items/items.module.scss'
import { ReleaseListItem } from '@/ui/release-list/release-list-item'
import { useId } from 'react'

export function ReleaseList ({
  releases,
  title,
  isExpanded = false,
  onExpand
}: {
  releases: ReleaseClient[];
  title: string;
  isExpanded?: boolean;
  onExpand?: () => void;
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <header className={styles['items-header']}>
        <h2 id={id}>{title}</h2>
        {onExpand && <ExpandCollapseButton isExpanded={isExpanded} onExpand={onExpand} />}
      </header>

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
