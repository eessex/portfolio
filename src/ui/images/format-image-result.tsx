import type { Image } from '@/lib/images/schemas/db'
import { Badges, itemBadges } from '@/ui/badges'
import { formattedFilename } from '@/ui/util'

export function formatImageResult(image: Image) {
  return (
    <>
      <span>
        {image.title || image.caption}
        <Badges badges={itemBadges(image)} />
      </span>
      <small>{formattedFilename(image.url)}</small>
    </>
  )
}
