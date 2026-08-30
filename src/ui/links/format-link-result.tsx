import type { Link } from '@/lib/links/schemas/db'
import { itemBadges } from '@/ui/badges'
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
