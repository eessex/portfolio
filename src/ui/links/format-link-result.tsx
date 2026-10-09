import type { Link } from '@/lib/links/schemas/db'
import { itemBadges } from '@/ui/badges/badges'
import type { NewItemSummaryActions } from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedDateTime, formattedLinkUrl } from '@/ui/util'

/**
 * "attribution, date", em-dash prefixed after a quotation (as in
 * `LinkItem`). Date omitted if missing/invalid (unsaved drafts).
 */
function pressLinkCitation(link: Link) {
  const rawDate = link.publishDate || link.createdAt
  const date =
    rawDate && !isNaN(new Date(rawDate).getTime())
      ? formattedDateTime(rawDate, 'xs')
      : undefined
  const citation = [link.attribution, date].filter(Boolean).join(', ')
  if (!citation) return undefined
  return link.quotation ? `— ${citation}` : citation
}

/** Press links: quotation (or title/url), citation, url — as in `LinkItem`. */
export function formatLinkResult(
  link: Link,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  const isPress = link.type === 'press'
  const display = link.title || formattedLinkUrl(link.url)
  const isQuoted = isPress && !!link.quotation
  return (
    <ItemResultLabel
      title={isQuoted ? <q>{link.quotation}</q> : display}
      details={isPress ? pressLinkCitation(link) : undefined}
      subtitle={
        (isQuoted || link.title) && formattedLinkUrl(link.url)
      }
      badges={itemBadges(link)}
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

/**
 * Renders a collapsed chip for a saved-but-unsubmitted "new" link,
 * matching a saved link's chip.
 */
export function formatNewLinkSummary(
  data: Record<string, unknown>,
  _previewUrl: string | undefined,
  { editButton, onRemove, removeLabel }: NewItemSummaryActions
) {
  return formatLinkResult(
    data as Link,
    onRemove,
    removeLabel,
    editButton
  )
}
