import {
  type EmbedCode,
  EmbedCodeHosts,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { capitalizeFirstLetter } from '@/lib/strings'
import type { Badge } from '@/lib/types'
import { Badges } from '@/ui/badges'
import styles from '@/ui/embed-codes/embed-code-details.module.scss'
import { formattedItemType } from '@/ui/util'

/**
 * `Host: Title`, e.g. `Mixcloud: My excellent Mix #21`
 * YouTube is special-cased with a capital "T".
 */
export function formattedEmbedCodeTitle(embedCode: EmbedCode) {
  let hostLabel = embedCode.host
    ? capitalizeFirstLetter(embedCode.host)
    : ''
  if (
    embedCode.type === EmbedCodeTypes.video &&
    embedCode.host === EmbedCodeHosts.youtube
  ) {
    hostLabel = 'YouTube'
  }

  const title = embedCode.title || 'Untitled'
  return hostLabel ? `${hostLabel}: ${title}` : title
}

export function EmbedCodeDetails({
  embedCode
}: {
  embedCode: EmbedCode
}) {
  const badges: Badge[] = [
    {
      text: formattedItemType(embedCode.type).trim(),
      color:
        embedCode.type === EmbedCodeTypes.video ? 'blue' : 'green'
    }
  ]
  if (embedCode.contentType) {
    badges.push({
      text: formattedItemType(embedCode.contentType).trim(),
      color: 'purple'
    })
  }

  return (
    <div className={styles['badges']}>
      <Badges badges={badges} />
    </div>
  )
}
