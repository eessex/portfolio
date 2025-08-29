import styles from '@/ui/expand-collapse-button/expand-collapse-button.module.scss'
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

export function ExpandCollapseButton ({
  isExpanded,
  onExpand
}: {
  isExpanded: boolean,
  onExpand: () => void
}) {
  return (
    // FIXME: add controls attribute
    <button
      onClick={onExpand}
      aria-label={isExpanded ? 'Collapse' : 'Expand'}
      className={`icon-button ${styles['expand-collapse-button']}`}
    >
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
