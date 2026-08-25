import { XMarkIcon } from '@heroicons/react/16/solid'

import type { Badge } from '@/lib/types'
import { Badges } from '@/ui/badges'
import {
  CoverImageThumbnail,
  type ThumbnailImage
} from '@/ui/cover-image-thumbnail'
import styles from '@/ui/item-result-label.module.scss'

export function ItemResultLabel({
  title,
  subtitle,
  badges = [],
  coverImage,
  thumbnail,
  extraActions,
  onRemove,
  removeLabel
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  badges?: Badge[]
  coverImage?: ThumbnailImage
  /**
   * pre-rendered thumbnail, taking `coverImage` slot's position.
   * next/image cannot render a file input preview.
   */
  thumbnail?: React.ReactNode
  /** Rendered after the title/subtitle, before the remove button. */
  extraActions?: React.ReactNode
  onRemove?: () => void
  removeLabel?: string
}) {
  return (
    <div className={styles['row']}>
      {thumbnail ??
        (coverImage && <CoverImageThumbnail image={coverImage} />)}
      <div className={styles['container']}>
        <span className={styles['title']}>
          <span className={styles['title-text']}>{title}</span>
          <Badges badges={badges} />
        </span>
        {subtitle && (
          <small className={styles['subtitle']}>{subtitle}</small>
        )}
      </div>
      {extraActions}
      {onRemove && (
        <button
          type='button'
          aria-label={removeLabel || 'Remove'}
          className={`${styles['remove']} button-icon`}
          onClick={onRemove}
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  )
}
