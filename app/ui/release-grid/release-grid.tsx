import type { ReleaseClient } from '@/lib/definitions'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import styles from '@/ui/items/items.module.scss'
import { ReleaseGridItem } from '@/ui/release-grid/release-grid-item'
import Link from 'next/link'
import { useId } from 'react'

export function ReleaseGrid ({
  releases,
  title,
  isExpanded = false,
  onExpand
}: {
  releases: ReleaseClient[];
  title?: string;
  isExpanded?: boolean;
  onExpand?: () => void;
}) {
  const id = useId()

  return (
    <section aria-labelledby={id} className={styles['items-grid']}>
      <header className={styles['items-header']}>
        <h2 id={id}>
          {title || (
            <Link href='/releases'>Releases</Link>
          )}
        </h2>
        {onExpand && <ExpandCollapseButton isExpanded={isExpanded} onExpand={onExpand} />}
      </header>
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
