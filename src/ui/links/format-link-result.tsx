import type { Link } from '@/lib/links/schemas/db'
import { Badges, itemBadges } from '@/ui/badges'
import { formattedLinkUrl } from '@/ui/util'

export function formatLinkResult(link: Link) {
  return (
    <>
      <span>
        {link.title || formattedLinkUrl(link.url)}
        <Badges badges={itemBadges(link)} />
      </span>
      {link.title && <small>{formattedLinkUrl(link.url)}</small>}
    </>
  )
}
