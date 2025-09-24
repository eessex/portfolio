import type { ReleaseClient } from '@/lib/releases/types'
import {
  combinePublishedEditions,
  formattedDateTime
} from '@/ui/util'

export function PublishedEditionsCombined ({
  publishedEditions,
  format = 'lg'
}: {
  publishedEditions: ReleaseClient['publishedEditions']
  format?: 'sm' | 'lg'
}) {
  if (!publishedEditions || publishedEditions.length === 0) return null

  return (
    <div>
      {format === 'lg' && (<h4 className='visually-hidden'>Published by:</h4>)}
      <ul>
        {combinePublishedEditions(publishedEditions).map((edition, id) => (
          <li key={`${edition.publisher}-${edition.publishDate}-${id}`}>
            {edition.format}, {edition.publisher}{format === 'lg' && ', ' + formattedDateTime(edition.publishDate, 'xxs')}
          </li>
        ))}
      </ul>
    </div>
  )
}
