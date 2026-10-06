import {
  SpeakerWaveIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

import type { WithCoverImageUrls } from '@/lib/embed-codes/cover-image-url'
import {
  type EmbedCode,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { itemBadges } from '@/ui/badges/badges'
import thumbnailStyles from '@/ui/cover-image-thumbnail.module.scss'
import styles from '@/ui/embed-codes/format-embed-code-result.module.scss'
import { coverImageAspectByHost } from '@/ui/embed-codes/util'
import type { NewItemSummaryActions } from '@/ui/item-picker/item-picker'
import { ItemResultLabel } from '@/ui/item-result-label'

function mediaSubtitle(
  type: EmbedCode['type'] | undefined,
  host: string | undefined
) {
  if (!type) return host

  const MediaIcon =
    type === EmbedCodeTypes.audio ? SpeakerWaveIcon : VideoCameraIcon

  return (
    <span className={styles['host']}>
      {/* heroicons force aria-hidden, so label via hidden text */}
      <MediaIcon className={styles['media-icon']} />
      <span className='visually-hidden'>{`Contains ${type}: `}</span>
      {host}
    </span>
  )
}

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
      subtitle={mediaSubtitle(embedCode.type, embedCode.host)}
      badges={itemBadges({ contentType: embedCode.contentType })}
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
  { editButton, onRemove, removeLabel }: NewItemSummaryActions
) {
  const title = data.previewTitle as string | undefined
  const thumbnailUrl = data.previewThumbnailUrl as string | undefined
  const host = data.host as string | undefined
  const type = data.type as EmbedCode['type'] | undefined
  const contentType = data.contentType as
    | EmbedCode['contentType']
    | undefined

  return (
    <ItemResultLabel
      title={title || 'New embed code'}
      subtitle={mediaSubtitle(type, host)}
      badges={itemBadges({ contentType })}
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
      extraActions={editButton}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}
