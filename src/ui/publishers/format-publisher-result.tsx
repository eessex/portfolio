import type { Publisher } from '@/lib/publishers/schemas/db'
import { formattedItemType } from '@/ui/format/items'
import { ItemResultLabel } from '@/ui/item-result-label'

export function formatPublisherResult(
  publisher: Publisher,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={publisher.name}
      badges={
        publisher.type
          ? [{ text: formattedItemType(publisher.type) }]
          : undefined
      }
      onRemove={onRemove}
      removeLabel={removeLabel}
      extraActions={extraActions}
    />
  )
}
