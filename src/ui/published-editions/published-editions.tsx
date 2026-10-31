import type { PublishedEditionClient } from '@/lib/published-editions/schemas/client'
import type { ReleaseClient } from '@/lib/releases/types'
import { formattedDateTime } from '@/ui/format/dates'

function combinePublishedEditions(
  publishedEditions: ReleaseClient['publishedEditions']
) {
  const combined: Array<
    Omit<PublishedEditionClient, 'format'> & {
      formats?: string[]
      format?: string
    }
  > = []
  if (!publishedEditions || publishedEditions.length === 0)
    return combined

  publishedEditions.forEach((edition) => {
    const existing = combined.find(
      (item) =>
        item.publisher?.id === edition.publisher?.id &&
        new Date(item.publishDate).toISOString().substring(0, 10) ===
          new Date(edition.publishDate).toISOString().substring(0, 10)
    )
    if (!existing) {
      combined.push({
        ...edition,
        formats: [edition.format]
      })
    } else {
      existing.formats = existing.formats || []
      existing.formats.push(edition.format)
    }
  })

  // Format the formats array into a grammatical list, e.g., "LP, Cassette & Digital"
  combined.forEach((item) => {
    if (item.formats?.length === 1) {
      item.format = item.formats[0]
    } else if (item.formats?.length === 2) {
      item.format = `${item.formats[0]} & ${item.formats[1]}`
    } else {
      item.format = `${item.formats?.slice(0, -1).join(', ')} & ${item.formats?.[item.formats.length - 1]}`
    }
    delete item.formats
  })
  return combined
}

export function PublishedEditionsCombined({
  publishedEditions,
  format = 'lg'
}: {
  publishedEditions: ReleaseClient['publishedEditions']
  format?: 'sm' | 'lg'
}) {
  if (!publishedEditions || publishedEditions.length === 0)
    return null

  return (
    <div>
      {format === 'lg' && (
        <h4 className='visually-hidden'>Published by:</h4>
      )}
      <ul>
        {combinePublishedEditions(publishedEditions).map(
          (edition, id) => (
            <li
              key={`${edition.publisher?.id}-${edition.publishDate}-${id}`}
            >
              {edition.format}, {edition.publisher?.name}
              {format === 'lg' &&
                ', ' + formattedDateTime(edition.publishDate, 'xxs')}
            </li>
          )
        )}
      </ul>
    </div>
  )
}
