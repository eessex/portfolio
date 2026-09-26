import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'

interface FeaturedToggleButtonProps {
  isCurrentlyFeatured: boolean
  onToggle: () => void
  featuredLabel: string
}

export function FeaturedToggleButton({
  isCurrentlyFeatured,
  onToggle,
  featuredLabel
}: FeaturedToggleButtonProps) {
  return (
    <button
      type='button'
      aria-label={
        isCurrentlyFeatured
          ? `Unset ${featuredLabel}`
          : `Set as ${featuredLabel}`
      }
      className={`${itemPickerStyles['featured-button']} button-icon`}
      onClick={onToggle}
    >
      {isCurrentlyFeatured ? <StarIconSolid /> : <StarIcon />}
    </button>
  )
}
