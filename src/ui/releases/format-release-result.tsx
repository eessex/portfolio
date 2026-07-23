import type { ReleaseClient } from '@/lib/releases/types'
import { Badges } from '@/ui/badges'
import { formattedItemTitle, formattedItemType } from '@/ui/util'

export function formatReleaseResult(release: ReleaseClient) {
  return (
    <span>
      {formattedItemTitle(release)}
      <Badges badges={[{ text: formattedItemType(release.type) }]} />
    </span>
  )
}
