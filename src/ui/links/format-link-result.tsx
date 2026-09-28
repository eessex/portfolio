import type { Link } from '@/lib/links/schemas/db'
import { itemBadges } from '@/ui/badges/badges'
import type { NewItemSummaryActions } from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedLinkUrl } from '@/ui/util'

export function formatLinkResult(
  link: Link,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={link.title || formattedLinkUrl(link.url)}
      subtitle={link.title && formattedLinkUrl(link.url)}
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
