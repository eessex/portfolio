import { XMarkIcon } from '@heroicons/react/16/solid'

import type { EmbeddedItemType } from '@/lib/schemas'
import { Input } from '@/ui/form/input'
import styles from '@/ui/selected-results/selected-results.module.scss'
import { itemTypeToLabel } from '@/ui/util'

export type SelectedResultProps = {
  as?: 'div' | 'li'
  isRequired?: boolean
  itemId: string
  itemType: EmbeddedItemType
  children: React.ReactNode
  onClick: () => void
}

export const SelectedResult = ({
  as: Component = 'div',
  isRequired,
  itemId,
  itemType,
  children,
  onClick
}: SelectedResultProps) => {
  const formattedItemType = itemTypeToLabel(itemType, true, true)
  const formattedIdLabel = `${itemTypeToLabel(itemType, true)} ID`

  return (
    <Component className={styles['selected-result']}>
      {children}

      <button
        aria-label={`Remove ${formattedItemType}`}
        className='button-icon'
        onClick={onClick}
      >
        <XMarkIcon />
      </button>

      <Input
        label={formattedIdLabel}
        value={itemId}
        attributes={{
          readOnly: true,
          hidden: true,
          required: isRequired
        }}
      />
    </Component>
  )
}
