import type { Image } from '@/lib/images/schemas/db'
import type { Badge } from '@/lib/types'
import { Badges } from '@/ui/badges'
import { CoverImageThumbnail } from '@/ui/cover-image-thumbnail'
import styles from '@/ui/item-result-label.module.scss'

/**
 * Shared layout for a `Combobox` dropdown row / `SelectedResult` chip's
 * content: an optional cover image thumbnail plus title + badges, with
 * an optional `<small>` subtitle line. Keeps every `formatXResult`
 * helper structurally identical instead of hand-rolling the same
 * markup per item type. Owns the flex-column text wrapper
 * (`.container`) itself, rather than relying on `Combobox`/
 * `SelectedResult` to supply it — those two only wrap arbitrary
 * `ReactNode` content generically, so a `formatResult` that doesn't
 * render `ItemResultLabel` won't get this layout for free.
 */
export function ItemResultLabel({
  title,
  subtitle,
  badges = [],
  coverImage
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  badges?: Badge[]
  coverImage?: Image
}) {
  return (
    <>
      {coverImage && <CoverImageThumbnail image={coverImage} />}
      <div className={styles['container']}>
        <span className={styles['title']}>
          <span className={styles['title-text']}>{title}</span>
          <Badges badges={badges} />
        </span>
        {subtitle && (
          <small className={styles['subtitle']}>{subtitle}</small>
        )}
      </div>
    </>
  )
}
