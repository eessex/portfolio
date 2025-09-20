import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

export function SortButton ({
  isAsc,
  onClick
}: {
  isAsc: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={isAsc ? 'Sort descending' : 'Sort ascending'}
    >
      Sort
      {isAsc ? <ArrowUpIcon /> : <ArrowDownIcon />}
    </button>
  )
}
