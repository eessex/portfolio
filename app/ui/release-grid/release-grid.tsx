import { ReleaseClient } from '@/lib/definitions'
import Link from 'next/link'
import ReleaseGridItem from '@/ui/release-grid/release-grid-item'
import { useId } from 'react'
import styles from '@/ui/items-grid/items-grid.module.scss'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button'

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
      <header>
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
