import type { Publisher } from '@/lib/publishers/schemas/db'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemType } from '@/ui/util'

export function formatPublisherResult(
  publisher: Publisher,
  onRemove?: () => void,
  removeLabel?: string
) {
  return (
    <ItemResultLabel
      title={publisher.name}
      badges={[{ text: formattedItemType(publisher.type) }]}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}
