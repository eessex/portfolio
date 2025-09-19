import type { ReleaseClient } from '@/lib/releases/types'
import { ExpandCollapseButton } from '@/ui/expand-collapse-button/expand-collapse-button'
import styles from '@/ui/items/items.module.scss'
import { ReleaseListItem } from '@/ui/release-list/release-list-item'
import { useId } from 'react'

export function ReleaseList ({
  isExpanded = false,
  onExpand,
  releases,
  title
}: {
  isExpanded?: boolean
  onExpand?: () => void
  releases: ReleaseClient[]
  title: string
}) {
  const id = useId()
  const releasesId = useId()

  return (
    <section aria-labelledby={id} className={styles['items-list']}>
      <header className={styles['items-header']}>
        <h2 id={id}>{title}</h2>

        {onExpand && (
          <ExpandCollapseButton
            ariaControls={releasesId}
            closeLabel='Collapse releases'
            isExpanded={isExpanded}
            onExpand={onExpand}
            openLabel='Expand releases'
          />
        )}
      </header>

      <ul id={releasesId}>
        {releases.map((release, index) => (
          <li key={release.id}>
            <ReleaseListItem release={release} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
