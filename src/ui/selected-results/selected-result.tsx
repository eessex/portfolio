import { XMarkIcon } from '@heroicons/react/16/solid'

import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import { itemTypeSingulars, itemTypeToLabel } from '@/lib/schemas'
import { Input } from '@/ui/form/input'
import styles from '@/ui/selected-results/selected-results.module.scss'

export type SelectedResultProps = {
  as?: 'div' | 'li'
  isRequired?: boolean
  id: string
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id` (e.g. `releaseId`); pass explicitly when the
   * field represents a specific-purpose relation rather than the item type
   * itself (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  children: React.ReactNode
  onClick: () => void
}

export const SelectedResult = ({
  as: Component = 'div',
  isRequired,
  id,
  itemType,
  name,
  children,
  onClick
}: SelectedResultProps) => {
  const formattedItemType = itemTypeToLabel(itemType, true, true)
  const formattedIdLabel = `${itemTypeToLabel(itemType, true)} ID`
  const fieldName = name ?? `${itemTypeSingulars[itemType]}Id`

  return (
    <Component className={styles['selected-result']}>
      {children}

      <button
        type='button'
        aria-label={`Remove ${formattedItemType}`}
        className='button-icon'
        onClick={onClick}
      >
        <XMarkIcon />
      </button>

      <Input
        label={formattedIdLabel}
        value={id}
        attributes={{
          name: fieldName,
          readOnly: true,
          type: 'hidden',
          required: isRequired
        }}
      />
    </Component>
  )
}
