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
const assignedColorsByType = new Map<string, Badge['color']>()

function colorForType(type: string) {
  let color = assignedColorsByType.get(type)
  if (!color) {
    color =
      badgeColorPalette[
        assignedColorsByType.size % badgeColorPalette.length
      ]
    assignedColorsByType.set(type, color)
  }
  return color
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
