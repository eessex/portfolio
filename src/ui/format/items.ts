import type { ReleaseClient } from '@/lib/releases/types'
import type { EmbeddedItemType } from '@/lib/schemas'
import { singularizePath } from '@/lib/schemas'
import { camelToSentence, snakeToCamel } from '@/lib/strings'
import type { PageItemClient } from '@/lib/types'

export const formattedItemType = (
  type: string,
  isUpcoming = false,
  isPlural = false
) => {
  let unformatted = snakeToCamel(type)

  switch (type) {
    case 'feature':
      unformatted = 'featuredOn'
      break
  }
  // fixme
  return `${isUpcoming ? ' Upcoming ' : ''} ${camelToSentence(isPlural ? unformatted : singularizePath(unformatted as EmbeddedItemType))}`
}

export function formattedItemTitle(item: PageItemClient) {
  const { artist, displayArtist = artist } = item as ReleaseClient
  return displayArtist
    ? `${displayArtist}: ${item.title}`
    : item.title
}
