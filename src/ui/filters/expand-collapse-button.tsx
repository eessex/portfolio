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
      className='button-sm'
      aria-controls={ariaControls}
      aria-label={isExpanded ? closeLabel : openLabel}
      onClick={() => onExpand(prev => !prev)}
    >
      {isExpanded ? 'Collapse' : 'Expand'}
      {isExpanded ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
    </button>
  )
}
