import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import styles from '@/ui/expand-collapse-button/expand-collapse-button.module.scss'

export function ExpandCollapseButton ({
  isExpanded,
  onExpand
}: {
  isExpanded: boolean,
  onExpand: () => void
}) {
  return (
    <button
      onClick={onExpand}
      aria-label={isExpanded ? 'Collapse' : 'Expand'}
      className={`icon-button ${styles['expand-collapse-button']}`}
    >
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
