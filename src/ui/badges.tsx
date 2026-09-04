import { embedCodeContentTypes } from '@/lib/embed-codes/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { snakeToSentence } from '@/lib/strings'
import type { Badge, EmbeddedItem } from '@/lib/types'
import styles from '@/ui/badges.module.scss'

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

// Every badgeable type in stable order to avoid hydration errors
const badgeTypes: readonly string[] = [
  ...imageTypes,
  ...embedCodeContentTypes
]

function colorForType(type: string): Badge['color'] {
  const index = badgeTypes.indexOf(type)
  if (index === -1) return 'green'
  return badgeColorPalette[index % badgeColorPalette.length]
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
