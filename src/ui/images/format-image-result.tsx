import type { Image } from '@/lib/images/schemas/db'
import { Badges, itemBadges } from '@/ui/badges'

export function formatImageResult(image: Image) {
  return (
    <>
      <span>{image.title || image.caption}</span>
      <small>{image.url}</small>
      <Badges badges={itemBadges(image)} />
    </>
  )
}
