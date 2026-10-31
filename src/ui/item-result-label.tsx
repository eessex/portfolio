import { XMarkIcon } from '@heroicons/react/16/solid'

import type { Badge } from '@/lib/types'
import { Badges } from '@/ui/badges/badges'
import {
  CoverImageThumbnail,
  type ThumbnailImage
} from '@/ui/cover-image-thumbnail'
import styles from '@/ui/item-result-label.module.scss'

export function ItemResultLabel({
  title,
  subtitle,
  details,
  badges = [],
  coverImage,
  isThumbnailSquare,
  thumbnail,
  extraActions,
  onRemove,
  removeLabel
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Rendered between title and subtitle. */
  details?: React.ReactNode
  badges?: Badge[]
  coverImage?: ThumbnailImage
  isThumbnailSquare?: boolean
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
        (coverImage && (
          <CoverImageThumbnail
            image={coverImage}
            isSquare={isThumbnailSquare}
          />
        ))}
      <div className={styles['container']}>
        <span className={styles['title']}>
          <span className={styles['title-text']}>{title}</span>
          <Badges badges={badges} />
        </span>
        {details && (
          <small className={styles['details']}>{details}</small>
        )}
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
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <XMarkIcon />
        </button>
      )}
    </div>
  )
}
