import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import type { EventClient } from '@/lib/events/types'
import type { ProjectClient } from '@/lib/projects/types'
import type { ReleaseClient } from '@/lib/releases/types'
import { PagePaths } from '@/lib/schemas'
import type { PageItemClient } from '@/lib/types'
import {
  type DateFormatSize,
  formattedDateTime
} from '@/ui/format/dates'

export function itemSortDate(
  item: PageItemClient,
  isDefaultPreferred = false
): Date {
  if (isDefaultPreferred) {
    return item.updatedAt || item.createdAt
  }
  switch (item.path) {
    case PagePaths.events:
      return (item as EventClient).startTime
    case PagePaths.projects:
      return (item as ProjectClient).startDate || item.createdAt
    case PagePaths.releases:
      return (item as ReleaseClient).releaseDate
    default:
      return (
        (item as PageItemClient).updatedAt ||
        (item as PageItemClient).createdAt
      )
  }
}

export function itemDisplayDateFormat(
  item: PageItemClient
): DateFormatSize {
  switch (item.path) {
    case PagePaths.events:
      return 'md'
    case PagePaths.projects:
    case PagePaths.releases:
      return 'xxs'
    default:
      return 'sm'
  }
}

export function FormattedItemDate({
  item,
  format,
  timezone
}: {
  item: PageItemClient
  format?: DateFormatSize
  /** defaults to an event's venue timezone */
  timezone?: Intl.DateTimeFormatOptions['timeZone']
}) {
  timezone ??= (item as EventClient).venue?.timezone
  const date = new Date(itemSortDate(item))
  const isProject = item.path === PagePaths.projects
  const startTimezone =
    isProject && !(item as ProjectClient).startDate
      ? (timezone ?? DEFAULT_TIME_ZONE)
      : timezone
  const rawEndDate = (item as ProjectClient).endDate
  const endDate = rawEndDate ? new Date(rawEndDate) : undefined
  const isUpcomingEvent =
    item.path === PagePaths.events &&
    !!(item as EventClient).isUpcoming
  const dateFormat = isUpcomingEvent
    ? undefined
    : format || itemDisplayDateFormat(item)

  return (
    <>
      <time dateTime={date?.toISOString()}>
        {formattedDateTime(date, dateFormat, startTimezone)}
      </time>

      {isProject && endDate ? (
        <>
          –
          <time dateTime={endDate.toISOString()}>
            {formattedDateTime(endDate, dateFormat, timezone)}
          </time>
        </>
      ) : (
        isProject && '–present'
      )}
    </>
  )
}
