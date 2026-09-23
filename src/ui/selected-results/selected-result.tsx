import { itemIdFieldName } from '@/lib/item-fields'
import type { EmbeddedItemType, PagePath } from '@/lib/schemas'
import { itemTypeToLabel } from '@/lib/schemas'
import { Input } from '@/ui/form/input'
import styles from '@/ui/selected-results/selected-results.module.scss'

export type SelectedResultProps = {
  as?: 'div' | 'li'
  id: string
  itemType: EmbeddedItemType | PagePath
  /**
   * Form field name for the hidden id input. Defaults to
   * `${singular(itemType)}Id` (e.g. `releaseId`); pass explicitly when the
   * field represents a specific-purpose relation rather than the item type
   * itself (e.g. `coverImageId` for an `images` item).
   */
  name?: string
  /**
   * A drag handle (e.g. from `SortableList`), rendered inside this
   * component's own background/border alongside `children` rather
   * than outside it.
   */
  dragHandle?: React.ReactNode
  children: React.ReactNode
}

export const SelectedResult = ({
  as: Component = 'div',
  id,
  itemType,
  name,
  dragHandle,
  children
}: SelectedResultProps) => {
  const formattedIdLabel = `${itemTypeToLabel(itemType, true)} ID`
  const fieldName = itemIdFieldName(itemType, name)

  return (
    <Component className={styles['selected-result']}>
      {dragHandle}
      <div className={styles['content']}>{children}</div>

      <Input
        label={formattedIdLabel}
        value={id}
        attributes={{
          name: fieldName,
          readOnly: true,
          type: 'hidden'
        }}
      />
    </Component>
  )
}
