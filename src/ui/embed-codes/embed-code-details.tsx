import {
  type EmbedCode,
  EmbedCodeHosts,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { capitalizeFirstLetter } from '@/lib/strings'

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
