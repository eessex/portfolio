import type { Link } from '@/lib/links/schemas/db'
import { Badges, itemBadges } from '@/ui/badges'

export function LinkDetails({ link }: { link: Link }) {
  return <Badges badges={itemBadges(link)} />
}
