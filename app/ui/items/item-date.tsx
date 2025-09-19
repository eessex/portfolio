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
    // case 'projects':
    //   return (item as ProjectClient).startDate || item.createdAt
    default:
      return (item as PageItemClient).updatedAt || (item as PageItemClient).createdAt
  }
}

function itemDisplayDateFormat<T extends PageItemClient> (item: T): DateFormatSize {
  switch (item.path) {
    case 'events':
      return 'md'
    case 'releases':
      return 'xxs'
    // case 'projects':
    //   return 'xxs'
    default:
      return 'sm'
  }
}

export function FormattedItemDate<T extends PageItemClient> ({
  item,
  format,
  timezone
}: {
  item: T,
  format?: DateFormatSize,
  timezone?: Intl.DateTimeFormatOptions['timeZone']
}) {
  const date = itemSortDate(item)
  // const isProject = item.path === 'projects'

  return (
    <>
      <time dateTime={date?.toISOString()}>
        {formattedDateTime(date, format || itemDisplayDateFormat(item), timezone)}
      </time>
      {/* {isProject && (item as ProjectClient).endDate
        ? (
          <> – <time dateTime={(item as ProjectClient).endDate?.toISOString()}>{formattedDateTime((item as ProjectClient).endDate!, format || itemDisplayDateFormat(item), timezone)}</time></>
          )
        : isProject && ' – present'} */}
    </>
  )
}
