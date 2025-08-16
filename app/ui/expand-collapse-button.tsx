import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

export function ExpandCollapseButton ({
  isExpanded,
  onExpand
}: {
  isExpanded: boolean,
  onExpand: () => void
}) {
  return (
    <button onClick={onExpand} aria-label={isExpanded ? 'Collapse' : 'Expand'} className='icon-button' style={{ marginBottom: '-.5rem' }}>
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
