import type { EventClient } from '@/lib/events/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import { formattedDateTime, type DateFormatSize } from '@/ui/util'

export function itemSortDate (item: PageItemClient, isDefaultPreferred = false): Date {
  if (isDefaultPreferred) {
    return item.updatedAt || item.createdAt
  }
  switch (item.path) {
    case 'events':
      return (item as EventClient).startTime
    case 'releases':
      return (item as ReleaseClient).releaseDate
    default:
      return (item as PageItemClient).updatedAt || (item as PageItemClient).createdAt
  }
}

function itemDisplayDateFormat (item: PageItemClient): DateFormatSize {
  switch (item.path) {
    case 'events':
      return 'md'
    case 'releases':
      return 'xxs'
    default:
      return 'sm'
  }
}

export function FormattedItemDate ({
  item,
  format,
  timezone
}: {
  item: PageItemClient,
  format?: DateFormatSize,
  timezone?: Intl.DateTimeFormatOptions['timeZone']
}) {
  const date = itemSortDate(item)

  return (
    <>
      <time dateTime={date?.toISOString()}>
        {formattedDateTime(date, format || itemDisplayDateFormat(item), timezone)}
      </time>
    </>
  )
}
