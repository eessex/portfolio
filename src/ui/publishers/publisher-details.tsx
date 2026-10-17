import {
  type Publisher,
  PublisherTypes
} from '@/lib/publishers/schemas/db'
import type { Badge } from '@/lib/types'
import { Badges } from '@/ui/badges/badges'
import { formattedItemType } from '@/ui/util'

const publisherTypeColors: Record<
  NonNullable<Publisher['type']>,
  Badge['color']
> = {
  [PublisherTypes.recordLabel]: 'green',
  [PublisherTypes.publishingHouse]: 'blue',
  [PublisherTypes.museum]: 'purple'
}

export function PublisherDetails({
  publisher
}: {
  publisher: Publisher
}) {
  if (!publisher.type) return null

  return (
    <Badges
      badges={[
        {
          text: formattedItemType(publisher.type),
          color: publisherTypeColors[publisher.type]
        }
      ]}
    />
  )
}
