import { embedCodeContentTypes } from '@/lib/embed-codes/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { linkTypes } from '@/lib/links/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import { snakeToSentence } from '@/lib/strings'
import type { Badge, EmbeddedItem } from '@/lib/types'
import styles from '@/ui/badges/badges.module.scss'

export function Badges({ badges }: { badges: Badge[] }) {
  return (
    <div className={styles['badges']}>
      {badges.map((badge, index) => (
        <mark
          key={index}
          className={`badge badge-${badge.color || 'green'}`}
        >
          {badge.text}
        </mark>
      ))}
    </div>
  )
}

const badgeColorPalette: Badge['color'][] = [
  'green',
  'blue',
  'purple',
  'orange',
  'rose',
  'indigo'
]

// Every badgeable type in stable order to avoid hydration errors.
// Deduped so a type shared across domains (e.g. 'press') keeps one color.
const badgeTypes = new Set<string>([
  ...imageTypes,
  ...embedCodeContentTypes,
  ...linkTypes,
  ...publisherTypes
])

const colorByType = new Map<string, Badge['color']>(
  Array.from(badgeTypes, (type, index) => [
    type,
    badgeColorPalette[index % badgeColorPalette.length]
  ])
)

function colorForType(type: string): Badge['color'] {
  return colorByType.get(type) ?? 'green'
}

export function itemBadges(item: Partial<EmbeddedItem>): Badge[] {
  const { type, contentType } = item as {
    type?: string
    contentType?: string
  }
  const value = contentType || type
  if (!value) return []

  return [
    { text: snakeToSentence(value), color: colorForType(value) }
  ]
}
