import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'

export function ExpandCollapseButton ({
  ariaControls,
  closeLabel,
  isExpanded,
  onExpand,
  openLabel
}: {
  ariaControls: string
  closeLabel: string
  isExpanded: boolean
  onExpand: React.Dispatch<React.SetStateAction<boolean>>
  openLabel: string
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
