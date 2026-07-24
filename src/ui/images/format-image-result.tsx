import type { Image } from '@/lib/images/schemas/db'
import { itemBadges } from '@/ui/badges'
import { ItemResultLabel } from '@/ui/item-result-label'
import { formattedFilename } from '@/ui/util'

export function formatImageResult(image: Image) {
  return (
    <ItemResultLabel
      title={image.title || image.caption}
      subtitle={formattedFilename(image.url)}
      badges={itemBadges(image)}
    />
  )
}
