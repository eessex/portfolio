import { itemTypeToLabel } from '@/lib/schemas'

describe('#itemTypeToLabel', () => {
  it('sentence-cases multi-word item types', () => {
    expect(itemTypeToLabel('embedCodes')).toBe('Embed codes')
    expect(itemTypeToLabel('publishedEditions', true)).toBe(
      'Published edition'
    )
  })

  it('downcases every word when requested', () => {
    expect(itemTypeToLabel('embedCodes', false, true)).toBe(
      'embed codes'
    )
  })
})
