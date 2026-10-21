import {
  type EmbedCode,
  type EmbedCodeHost,
  EmbedCodeHosts
} from '@/lib/embed-codes/schemas/db'
import { capitalizeFirstLetter } from '@/lib/strings'

/** e.g. `Bandcamp`; YouTube is special-cased with a capital "T". */
export function embedCodeHostLabel(host: EmbedCodeHost) {
  return host === EmbedCodeHosts.youtube
    ? 'YouTube'
    : capitalizeFirstLetter(host)
}

/** `Host: Title`, e.g. `Mixcloud: My excellent Mix #21` */
export function formattedEmbedCodeTitle(embedCode: EmbedCode) {
  const hostLabel = embedCode.host
    ? embedCodeHostLabel(embedCode.host)
    : ''

  const title = embedCode.title || 'Untitled'
  return hostLabel ? `${hostLabel}: ${title}` : title
}
