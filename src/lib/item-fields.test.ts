import {
  emptyListFieldName,
  featuredFlagFieldName,
  indexedItemFieldPrefix,
  itemFieldPrefix,
  itemIdFieldName
} from '@/lib/item-fields'

describe('item field names', () => {
  describe('#itemIdFieldName', () => {
    it("defaults to the item type's singular", () => {
      expect(itemIdFieldName('venues')).toBe('venueId')
      expect(itemIdFieldName('publishers')).toBe('publisherId')
    })

    it('prefers an explicit relation name', () => {
      expect(itemIdFieldName('images', 'coverImageId')).toBe(
        'coverImageId'
      )
    })
  })

  describe('#itemFieldPrefix', () => {
    it('namespaces inline fields under the id field they accompany', () => {
      expect(itemFieldPrefix('venueId')).toBe('venue.')
      expect(itemFieldPrefix('coverImageId')).toBe('coverImage.')
    })

    it('keeps two pickers of one item type distinct', () => {
      expect(itemFieldPrefix('coverImageId')).not.toBe(
        itemFieldPrefix('heroImageId')
      )
    })

    it('leaves a name without an Id suffix alone', () => {
      expect(itemFieldPrefix('venue')).toBe('venue.')
    })
  })

  describe('#indexedItemFieldPrefix', () => {
    it('indexes an entry under the array field name', () => {
      expect(indexedItemFieldPrefix('images', 0)).toBe('images[0].')
      expect(indexedItemFieldPrefix('images', 2)).toBe('images[2].')
    })
  })

  describe('#featuredFlagFieldName', () => {
    it('flags the array field it belongs to', () => {
      expect(featuredFlagFieldName('embedCodes')).toBe(
        'embedCodesFeatured'
      )
    })
  })

  describe('#emptyListFieldName', () => {
    it('marks an emptied list', () => {
      expect(emptyListFieldName('images')).toBe('images[]')
    })
  })
})
