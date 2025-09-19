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
      aria-label={isExpanded ? 'Collapse all items' : 'Expand all items'}
      className='text-sm'
    >
      {isExpanded ? 'Collapse' : 'Expand'}
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
