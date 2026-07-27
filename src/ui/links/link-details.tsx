import type { Link } from '@/lib/links/schemas/db'
import { Badges, itemBadges } from '@/ui/badges'
import styles from '@/ui/links/link-details.module.scss'

export function LinkDetails({ link }: { link: Link }) {
  return (
    <div className={styles['badges']}>
      <Badges badges={itemBadges(link)} />
    </div>
  )
}
