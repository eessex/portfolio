import {
  type EmbedCode,
  EmbedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import type { Image } from '@/lib/images/types'
import type { Link } from '@/lib/links/schemas/db'
import type { Badge, EmbeddedItem } from '@/lib/types'
import { usedOnPages } from '@/ui/util'

export function Badges({ badges }: { badges: Badge[] }) {
  return (
    <>
      {badges.map((badge, index) => (
        <mark
          key={index}
          className={`badge badge-${badge.color || 'green'}`}
        >
          {badge.text}
        </mark>
      ))}
    </>
  )
}

export function itemBadges(
  item: Partial<EmbeddedItem>,
  isUnusedIncluded = false
): Badge[] {
  const usedOn = usedOnPages(item)
  const badges: Badge[] = []
  const link = item as Link
  const image = item as Image
  const embedCode = item as EmbedCode

  if (link.type === 'press' || image.isPress) {
    badges.push({ text: 'Press' })
  }
  if (link.type === 'social') {
    badges.push({
      text: 'Footer link',
      color: 'blue'
    })
  }
  if (link.type === 'buy_link') {
    badges.push({
      text: 'Buy link',
      color: 'purple'
    })
  }
  if (link.type === 'stream_link') {
    badges.push({
      text: 'Stream link',
      color: 'orange'
    })
  }
  if (embedCode.type === EmbedCodeTypes.audio) {
    badges.push({ text: 'Audio' })
  }
  if (embedCode.type === EmbedCodeTypes.video) {
    badges.push({
      text: 'Video',
      color: 'blue'
    })
  }
  if (
    isUnusedIncluded &&
    usedOn.length === 0 &&
    link.type !== 'social'
  ) {
    badges.push({
      text: 'Not used',
      color: 'red'
    })
  }
  return badges
}
