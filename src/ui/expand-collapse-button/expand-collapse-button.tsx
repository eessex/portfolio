import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

export function ExpandCollapseButton ({
  ariaControls,
  isExpanded,
  onExpand,
  openLabel,
  closeLabel
}: {
  ariaControls: string
  isExpanded: boolean
  onExpand: React.Dispatch<React.SetStateAction<boolean>>
  openLabel: string
  closeLabel: string
}) {
  return (
    <button
      aria-controls={ariaControls}
      aria-label={isExpanded ? closeLabel : openLabel}
      className='text-sm'
      onClick={() => onExpand(prev => !prev)}
    >
      {isExpanded ? 'Collapse' : 'Expand'}
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
