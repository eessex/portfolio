import type { Publisher } from '@/lib/publishers/schemas/db'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemType } from '@/ui/util'

export function formatPublisherResult(publisher: Publisher) {
  return (
    <ItemResultLabel
      title={publisher.name}
      badges={[{ text: formattedItemType(publisher.type) }]}
    />
  )
}
