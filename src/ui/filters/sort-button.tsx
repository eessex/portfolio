import {
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'

export function SortButton ({
  ariaControls,
  isAsc,
  onClick
}: {
  ariaControls: string
  isAsc: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-controls={ariaControls}
      onClick={onClick}
      aria-label={isAsc ? 'Sort descending' : 'Sort ascending'}
    >
      Sort
      {isAsc ? <ArrowUpIcon /> : <ArrowDownIcon />}
    </button>
  )
}
