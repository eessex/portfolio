import type { ReleaseClient } from '@/lib/releases/types'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedItemTitle, formattedItemType } from '@/ui/util'

export function formatReleaseResult(release: ReleaseClient) {
  return (
    <ItemResultLabel
      title={formattedItemTitle(release)}
      badges={[{ text: formattedItemType(release.type) }]}
    />
  )
}
