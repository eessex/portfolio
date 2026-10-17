import type { Publisher } from '@/lib/publishers/schemas/db'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemType } from '@/ui/util'

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
