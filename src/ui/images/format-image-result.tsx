import type { Image } from '@/lib/images/schemas/db'
import { itemBadges } from '@/ui/badges/badges'
import thumbnailStyles from '@/ui/cover-image-thumbnail.module.scss'
import { formattedFilename } from '@/ui/format/urls'
import type { NewItemSummaryActions } from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'

/**
 * Renders a collapsed chip for a saved image.
 */
export function formatImageResult(
  image: Image,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={image.title || image.caption}
      subtitle={formattedFilename(image.url)}
      badges={itemBadges(image)}
      coverImage={image}
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

/**
 * Renders a collapsed chip for a saved-but-unsubmitted "new" image.
 */
export function formatNewImageSummary(
  data: Record<string, unknown>,
  previewUrl: string | undefined,
  { editButton, onRemove, removeLabel }: NewItemSummaryActions
) {
  const fileName = (data.file as File | undefined)?.name
  const label = (data.title as string) || (data.caption as string)
  return (
    <ItemResultLabel
      title={label || fileName || 'New image'}
      subtitle={label ? fileName : undefined}
      thumbnail={
        previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={(data.alt as string) || ''}
            className={thumbnailStyles['cover-image']}
          />
        )
      }
      extraActions={editButton}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

/** A site icon's chip, previewing the square it's cropped to. */
export function formatSiteIconResult(
  image: Image,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  return (
    <ItemResultLabel
      title={image.title || image.caption}
      subtitle={formattedFilename(image.url)}
      coverImage={image}
      isThumbnailSquare
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

export function formatNewSiteIconSummary(
  data: Record<string, unknown>,
  previewUrl: string | undefined,
  { editButton, onRemove, removeLabel }: NewItemSummaryActions
) {
  const fileName = (data.file as File | undefined)?.name
  const label = (data.title as string) || (data.caption as string)
  return (
    <ItemResultLabel
      title={label || fileName || 'New image'}
      subtitle={label ? fileName : undefined}
      thumbnail={
        previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={(data.alt as string) || ''}
            className={`${thumbnailStyles['cover-image']} ${thumbnailStyles['square']}`}
          />
        )
      }
      extraActions={editButton}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}
