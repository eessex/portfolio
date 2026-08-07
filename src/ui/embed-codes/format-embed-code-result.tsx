import type { WithCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import { itemBadges } from '@/ui/badges'
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
