import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import type { PageItemClient } from '@/lib/types'
import {
  type DateFormatSize,
  formattedDateTime,
  isUpcomingDate
} from '@/ui/util'

export function itemSortDate (item: PageItemClient, isDefaultPreferred = false): Date {
  if (isDefaultPreferred) {
    return item.updatedAt || item.createdAt
  }
  switch (item.path) {
    case 'events':
      return (item as EventClient).startTime
    case 'projects':
      return (item as ProjectClient).startDate || item.createdAt
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
    case 'projects':
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
  item: PageItemClient
  format?: DateFormatSize
  timezone?: Intl.DateTimeFormatOptions['timeZone']
}) {
  const date = new Date(itemSortDate(item))
  const isProject = item.path === 'projects'
  const isUpcomingEvent = item.path === 'events' && isUpcomingDate((item as EventClient).startTime)
  const dateFormat = isUpcomingEvent ? undefined : format || itemDisplayDateFormat(item)

  return (
    <>
      <time dateTime={date?.toISOString()}>
        {formattedDateTime(date, dateFormat, timezone)}
      </time>

      {isProject && (item as ProjectClient).endDate
        ? (
          <>–<time dateTime={(item as ProjectClient).endDate?.toISOString()}>{formattedDateTime((item as ProjectClient).endDate!, dateFormat, timezone)}</time></>
          )
        : isProject && '–present'}
    </>
  )
}
