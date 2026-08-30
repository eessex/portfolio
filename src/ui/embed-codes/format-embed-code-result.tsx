import type { WithCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import type { EmbeddedItem } from '@/lib/types'
import { itemBadges } from '@/ui/badges'
import thumbnailStyles from '@/ui/cover-image-thumbnail.module.scss'
import { coverImageAspectByHost } from '@/ui/embed-codes/util'
import { ItemResultLabel } from '@/ui/item-result-label'

export function formatEmbedCodeResult(
  embedCode: EmbedCode & WithCoverImageUrls,
  onRemove?: () => void,
  removeLabel?: string,
  extraActions?: React.ReactNode
) {
  // Prefer the resized thumbnail for this small (32px) row render; fall
  // back to the full-size cover image for any pre-thumbnail records.
  const thumbnailUrl =
    embedCode.coverImageThumbnailUrl || embedCode.coverImageUrl

  return (
    <ItemResultLabel
      title={embedCode.title || 'Untitled'}
      subtitle={embedCode.host}
      badges={itemBadges(embedCode)}
      coverImage={
        thumbnailUrl
          ? {
              url: thumbnailUrl,
              aspect: coverImageAspectByHost(embedCode.host),
              alt: embedCode.title || 'Embed cover image'
            }
          : undefined
      }
      extraActions={extraActions}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}

/**
 * Renders a collapsed chip for a saved-but-unsubmitted "new" embed code.
 */
export function formatNewEmbedCodeSummary(
  data: Record<string, unknown>,
  _previewUrl: string | undefined,
  { onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }
) {
  const title = data.previewTitle as string | undefined
  const thumbnailUrl = data.previewThumbnailUrl as string | undefined
  const host = data.host as string | undefined

  return (
    <ItemResultLabel
      title={title || 'New embed code'}
      subtitle={host}
      badges={itemBadges(data as Partial<EmbeddedItem>)}
      thumbnail={
        thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title || ''}
            className={thumbnailStyles['cover-image']}
          />
        )
      }
      extraActions={
        <button type='button' className='button-sm' onClick={onEdit}>
          Edit
        </button>
      }
      onRemove={onRemove}
      removeLabel='Remove embed code'
    />
  )
}
