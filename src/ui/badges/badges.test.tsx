import { embedCodeContentTypes } from '@/lib/embed-codes/schemas/db'
import { imageTypes } from '@/lib/images/schemas/db'
import { linkTypes } from '@/lib/links/schemas/db'
import { publisherTypes } from '@/lib/publishers/schemas/db'
import type { Badge, EmbeddedItem } from '@/lib/types'
import { itemBadges } from '@/ui/badges/badges'

const colorOf = (item: Partial<EmbeddedItem>) =>
  itemBadges(item)[0]?.color

const palette: Badge['color'][] = [
  'green',
  'blue',
  'purple',
  'orange',
  'rose',
  'indigo'
]

describe('itemBadges', () => {
  it('returns no badge when the item has neither type nor contentType', () => {
    expect(itemBadges({})).toEqual([])
  })

  it('labels the badge with the sentence-cased type', () => {
    expect(
      itemBadges({ type: 'buy_link' } as Partial<EmbeddedItem>)
    ).toEqual([{ text: 'Buy link', color: expect.any(String) }])
  })

  it('prefers contentType over type', () => {
    const item = {
      type: 'press',
      contentType: 'podcast'
    } as Partial<EmbeddedItem>

    expect(itemBadges(item)[0].text).toBe('Podcast')
  })

  it('falls back to green for an unrecognized type', () => {
    expect(
      colorOf({ type: 'not-a-real-type' } as Partial<EmbeddedItem>)
    ).toBe('green')
  })

  it('assigns a palette color to every badgeable type', () => {
    const allTypes = [
      ...imageTypes,
      ...embedCodeContentTypes,
      ...linkTypes,
      ...publisherTypes
    ]

    allTypes.forEach((type) => {
      expect(palette).toContain(
        colorOf({ type } as Partial<EmbeddedItem>)
      )
    })
  })

  it.each([
    ['image', imageTypes],
    ['embed code', embedCodeContentTypes],
    ['link', linkTypes],
    ['publisher', publisherTypes]
  ])(
    'spreads %s types across more than one color',
    (_label, types) => {
      const colors = types.map((type) =>
        colorOf({ type } as Partial<EmbeddedItem>)
      )

      expect(new Set(colors).size).toBeGreaterThan(1)
    }
  )

  it.each(['press', 'documentation'])(
    'gives the shared type %s a single color',
    (shared) => {
      expect(colorOf({ type: shared } as Partial<EmbeddedItem>)).toBe(
        colorOf({
          contentType: shared
        } as Partial<EmbeddedItem>)
      )
    }
  )

  it('is stable across calls, so server and client agree', () => {
    const first = colorOf({ type: 'museum' } as Partial<EmbeddedItem>)

    expect(colorOf({ type: 'museum' } as Partial<EmbeddedItem>)).toBe(
      first
    )
  })
})
