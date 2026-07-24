import type { ReleaseClient } from '@/lib/releases/types'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemTitle, formattedItemType } from '@/ui/util'

export function formatReleaseResult(
  release: ReleaseClient,
  onRemove?: () => void,
  removeLabel?: string
) {
  return (
    <ItemResultLabel
      title={formattedItemTitle(release)}
      badges={[{ text: formattedItemType(release.type) }]}
      coverImage={release.coverImage}
      onRemove={onRemove}
      removeLabel={removeLabel}
    />
  )
}
