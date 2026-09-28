import { act, renderHook } from '@testing-library/react'

import {
  venueFixtureAlpha,
  venueFixtureBeta,
  venueFixtureGamma
} from '@/lib/venues/fixtures'
import type { Venue } from '@/lib/venues/schemas/db'
import { entryId, isDraft } from '@/ui/item-picker/item-picker-entry'
import { useItemPickerEntries } from '@/ui/item-picker/use-item-picker-entries'

URL.createObjectURL = jest.fn(() => 'blob:mock-preview')
URL.revokeObjectURL = jest.fn()

function makeValidation(
  overrides: Partial<{
    validateEntryStrict: boolean
    hasEntryContent: boolean
    file?: File
    summaryData: Record<string, unknown>
  }> = {}
) {
  return {
    validateEntryStrict: jest.fn(
      () => overrides.validateEntryStrict ?? true
    ),
    clearErrors: jest.fn(),
    hasEntryContent: jest.fn(() => overrides.hasEntryContent ?? true),
    readEntryValues: jest.fn(() => ({
      summaryData: overrides.summaryData ?? { name: 'A Venue' },
      file: overrides.file
    }))
  }
}

function setup(
  options: Partial<{
    isMulti: boolean
    existingItems: Venue[]
    isCreateFirst: boolean
    featured: { isInitiallyFeatured: boolean }
    validation: ReturnType<typeof makeValidation>
  }> = {}
) {
  const validation = options.validation ?? makeValidation()
  const hook = renderHook(() =>
    useItemPickerEntries<Venue, never>({
      isMulti: options.isMulti ?? false,
      existingItems: options.existingItems ?? [],
      isCreateFirst: options.isCreateFirst ?? false,
      featured: options.featured,
      validation
    })
  )
  return { ...hook, validation }
}

describe('useItemPickerEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial entries', () => {
    it('starts with existing items only when not create-first', () => {
      const { result } = setup({
        existingItems: [venueFixtureAlpha]
      })

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha }
      ])
    })

    it('starts with a blank draft when create-first with no existing items', () => {
      const { result } = setup({ isCreateFirst: true })

      expect(result.current.entries).toEqual([
        { kind: 'new', tempId: 'new-0', seq: 0 }
      ])
    })

    it('does not open a blank draft for a single-item picker that already has an item', () => {
      const { result } = setup({
        isCreateFirst: true,
        existingItems: [venueFixtureAlpha]
      })

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha }
      ])
    })

    it('opens the blank draft ahead of existing items for a create-first multi picker', () => {
      const { result } = setup({
        isMulti: true,
        isCreateFirst: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta]
      })

      expect(result.current.entries).toEqual([
        { kind: 'new', tempId: 'new-0', seq: 0 },
        { kind: 'existing', item: venueFixtureAlpha },
        { kind: 'existing', item: venueFixtureBeta }
      ])
    })

    it('keeps an initially-featured item pinned ahead of the blank draft', () => {
      const { result } = setup({
        isMulti: true,
        isCreateFirst: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: true }
      })

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha },
        { kind: 'new', tempId: 'new-0', seq: 0 },
        { kind: 'existing', item: venueFixtureBeta }
      ])
      expect(result.current.featuredEntry).toEqual({
        kind: 'existing',
        item: venueFixtureAlpha
      })
    })
  })

  describe('addExisting', () => {
    it('adds a new existing entry', () => {
      const { result } = setup()

      act(() => result.current.addExisting(venueFixtureAlpha))

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha }
      ])
    })

    it('ignores a duplicate of an already-selected item', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha]
      })

      act(() => result.current.addExisting(venueFixtureAlpha))

      expect(result.current.entries).toHaveLength(1)
    })

    it('inserts after a pinned featured entry rather than displacing it', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha],
        featured: { isInitiallyFeatured: true }
      })

      act(() => result.current.addExisting(venueFixtureBeta))

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha },
        { kind: 'existing', item: venueFixtureBeta }
      ])
      expect(result.current.featuredEntry).toEqual({
        kind: 'existing',
        item: venueFixtureAlpha
      })
    })
  })

  describe('addNew', () => {
    it('mints incrementing tempIds across calls', () => {
      const { result } = setup({ isMulti: true })

      let firstId = ''
      act(() => {
        firstId = result.current.addNew()
      })
      let secondId = ''
      act(() => {
        secondId = result.current.addNew()
      })

      expect(firstId).toBe('new-0')
      expect(secondId).toBe('new-1')
    })

    it('prepends the new draft ahead of existing entries', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha]
      })

      act(() => {
        result.current.addNew('query text')
      })

      expect(result.current.entries[0]).toMatchObject({
        kind: 'new',
        query: 'query text'
      })
    })
  })

  describe('editExisting', () => {
    it('swaps the existing chip for an editing draft carrying the same item', () => {
      const { result } = setup({
        existingItems: [venueFixtureAlpha]
      })

      let tempId = ''
      act(() => {
        tempId = result.current.editExisting(venueFixtureAlpha.id)!
      })

      expect(result.current.entries).toEqual([
        {
          kind: 'editing',
          item: venueFixtureAlpha,
          tempId,
          seq: 0
        }
      ])
    })

    it('drops an untouched blank draft when an edit opens', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha],
        validation: makeValidation({ hasEntryContent: false })
      })

      act(() => {
        result.current.addNew()
      })
      act(() => {
        result.current.editExisting(venueFixtureAlpha.id)
      })

      expect(
        result.current.entries.filter((e) => e.kind === 'new')
      ).toHaveLength(0)
    })

    it('saves a touched draft to its chip before the edit opens', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha]
      })

      act(() => {
        result.current.addNew()
      })
      act(() => {
        result.current.markEntryTouched('new-0')
      })
      act(() => {
        result.current.editExisting(venueFixtureAlpha.id)
      })

      expect(
        result.current.entries.find((e) => e.kind === 'new')
      ).toMatchObject({ isSaved: true })
    })

    it('does not open the edit while a touched draft is invalid', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha],
        validation: makeValidation({ validateEntryStrict: false })
      })

      act(() => {
        result.current.addNew()
      })
      act(() => {
        result.current.markEntryTouched('new-0')
      })
      let tempId: string | undefined = ''
      act(() => {
        tempId = result.current.editExisting(venueFixtureAlpha.id)
      })

      expect(tempId).toBeUndefined()
      expect(
        result.current.entries.find((e) => e.kind === 'existing')
      ).toBeDefined()
    })
  })

  describe('revertEditingEntry', () => {
    it('restores the read-only existing chip and drops the draft', () => {
      const { result, validation } = setup({
        existingItems: [venueFixtureAlpha]
      })

      let tempId = ''
      act(() => {
        tempId = result.current.editExisting(venueFixtureAlpha.id)!
      })
      const editingEntry = result.current.entries[0]
      act(() => result.current.revertEditingEntry(editingEntry))

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha }
      ])
      expect(validation.clearErrors).toHaveBeenCalledWith(tempId)
    })

    it('revokes the preview url of a saved draft being reverted', () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' })
      const { result } = setup({
        existingItems: [venueFixtureAlpha],
        validation: makeValidation({ file })
      })

      act(() => {
        result.current.editExisting(venueFixtureAlpha.id)
      })
      const draft = result.current.entries[0]
      act(() => {
        result.current.saveDraft(
          draft as Extract<
            (typeof result.current.entries)[number],
            { kind: 'editing' }
          >,
          0
        )
      })
      const saved = result.current.entries[0]
      act(() => result.current.revertEditingEntry(saved))

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(
        'blob:mock-preview'
      )
    })
  })

  describe('markEntryTouched', () => {
    it('flags the matching draft entry as touched', () => {
      const { result } = setup({ isCreateFirst: true })

      act(() => result.current.markEntryTouched('new-0'))

      expect(result.current.entries[0]).toMatchObject({
        isTouched: true
      })
    })
  })

  describe('setBusyEntry', () => {
    it('tracks a busy flag per tempId', () => {
      const { result } = setup({ isCreateFirst: true })

      act(() => result.current.setBusyEntry('new-0', true))
      expect(result.current.busyEntries).toEqual({ 'new-0': true })

      act(() => result.current.setBusyEntry('new-0', false))
      expect(result.current.busyEntries).toEqual({ 'new-0': false })
    })
  })

  describe('saveDraft', () => {
    it('does not collapse the entry when validation fails', () => {
      const { result } = setup({
        isCreateFirst: true,
        validation: makeValidation({ validateEntryStrict: false })
      })
      const draft = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >

      let didSave = true
      act(() => {
        didSave = result.current.saveDraft(draft, 0)
      })

      expect(didSave).toBe(false)
      expect(
        (result.current.entries[0] as { isSaved?: boolean }).isSaved
      ).toBeUndefined()
    })

    it('collapses the entry and snapshots its values on success', () => {
      const { result } = setup({
        isCreateFirst: true,
        validation: makeValidation({
          summaryData: { name: 'Saved Venue' }
        })
      })
      const draft = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >

      act(() => {
        result.current.saveDraft(draft, 0)
      })

      expect(result.current.entries[0]).toMatchObject({
        isSaved: true,
        summaryData: { name: 'Saved Venue' },
        previewUrl: undefined
      })
    })

    it('creates a preview object URL when the entry carries a file', () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' })
      const { result } = setup({
        isCreateFirst: true,
        validation: makeValidation({ file })
      })
      const draft = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >

      act(() => {
        result.current.saveDraft(draft, 0)
      })

      expect(URL.createObjectURL).toHaveBeenCalledWith(file)
      expect(result.current.entries[0]).toMatchObject({
        previewUrl: 'blob:mock-preview'
      })
    })
  })

  describe('editDraft', () => {
    it('re-opens a saved draft and revokes its preview url', () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' })
      const { result } = setup({
        isCreateFirst: true,
        validation: makeValidation({ file })
      })
      const draft = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >
      act(() => {
        result.current.saveDraft(draft, 0)
      })
      const saved = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >

      act(() => result.current.editDraft(saved))

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(
        'blob:mock-preview'
      )
      expect(result.current.entries[0]).toMatchObject({
        isSaved: false,
        previewUrl: undefined,
        summaryData: undefined
      })
    })

    it('drops another empty open draft, but not the one reopening', () => {
      const validation = makeValidation()
      const { result } = setup({ isMulti: true, validation })

      act(() => {
        result.current.addNew()
      })
      const first = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >
      act(() => {
        result.current.saveDraft(first, 0)
      })
      act(() => {
        result.current.addNew()
      })

      expect(result.current.entries).toHaveLength(2)
      validation.hasEntryContent.mockReturnValue(false)

      const saved = result.current.entries.find(
        (e) => isDraft(e) && e.isSaved
      ) as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >
      act(() => result.current.editDraft(saved))

      // the empty draft opened by the second addNew() is dropped;
      // only the reopened editor remains
      expect(result.current.entries).toHaveLength(1)
      expect(result.current.entries[0]).toMatchObject({
        tempId: saved.tempId,
        isSaved: false
      })
    })
  })

  describe('closeOpenDrafts', () => {
    it('returns true and leaves entries alone when there are no open drafts', () => {
      const { result } = setup({
        existingItems: [venueFixtureAlpha]
      })

      let ok = false
      act(() => {
        ok = result.current.closeOpenDrafts()
      })

      expect(ok).toBe(true)
    })

    it('saves every open draft when all are valid', () => {
      const { result } = setup({
        isMulti: true,
        validation: makeValidation()
      })

      act(() => {
        result.current.addNew()
      })

      let ok = false
      act(() => {
        ok = result.current.closeOpenDrafts()
      })

      expect(ok).toBe(true)
      expect(
        result.current.entries.every((e) => !isDraft(e) || e.isSaved)
      ).toBe(true)
    })

    it('drops an empty new draft without validating it', () => {
      const validation = makeValidation({ hasEntryContent: false })
      const { result } = setup({ isCreateFirst: true, validation })

      let ok = false
      act(() => {
        ok = result.current.closeOpenDrafts()
      })

      expect(ok).toBe(true)
      expect(validation.validateEntryStrict).not.toHaveBeenCalled()
      expect(result.current.entries).toEqual([])
    })

    it('validates an untouched edit before reverting it', () => {
      const validation = makeValidation({
        validateEntryStrict: false
      })
      const { result } = setup({
        existingItems: [venueFixtureAlpha],
        validation
      })
      act(() => {
        result.current.editExisting(venueFixtureAlpha.id)
      })

      let ok = true
      act(() => {
        ok = result.current.closeOpenDrafts()
      })

      expect(ok).toBe(false)
      expect(result.current.entries[0].kind).toBe('editing')
    })

    it('stops at the first invalid open draft', () => {
      const { result } = setup({
        isCreateFirst: true,
        validation: makeValidation({ validateEntryStrict: false })
      })

      let ok = true
      act(() => {
        ok = result.current.closeOpenDrafts()
      })

      expect(ok).toBe(false)
      expect(
        (result.current.entries[0] as { isSaved?: boolean }).isSaved
      ).toBeUndefined()
    })
  })

  describe('removeEntry', () => {
    it('removes the matching entry and disposes its side effects', () => {
      const { result, validation } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha]
      })

      act(() => {
        result.current.addNew()
      })
      const draft = result.current.entries[0]
      act(() => result.current.removeEntry(draft))

      expect(
        result.current.entries.some(
          (e) => entryId(e) === entryId(draft)
        )
      ).toBe(false)
      expect(validation.clearErrors).toHaveBeenCalled()
    })

    it('unsets featured when the featured entry is removed', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: true }
      })

      const featured = result.current.featuredEntry!
      act(() => result.current.removeEntry(featured))

      expect(result.current.featuredEntry).toBeUndefined()
    })
  })

  describe('featured toggling', () => {
    it('promotes an entry to the pinned front position', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: false }
      })

      const target = result.current.entries[1]
      act(() => result.current.setFeatured(target))

      expect(result.current.entries[0]).toEqual(target)
      expect(result.current.featuredEntry).toEqual(target)
    })

    it('unsets featured without moving the entry out of place', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: true }
      })

      act(() => result.current.unsetFeatured())

      expect(result.current.featuredEntry).toBeUndefined()
      expect(result.current.entries[0]).toEqual({
        kind: 'existing',
        item: venueFixtureAlpha
      })
    })
  })

  describe('reorderSortable', () => {
    it('applies a reorder while keeping the featured entry pinned ahead of it', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [
          venueFixtureAlpha,
          venueFixtureBeta,
          venueFixtureGamma
        ],
        featured: { isInitiallyFeatured: true }
      })

      const [, second, third] = result.current.entries
      act(() => result.current.reorderSortable([third, second]))

      expect(result.current.entries).toEqual([
        { kind: 'existing', item: venueFixtureAlpha },
        third,
        second
      ])
    })

    it('keeps an open draft editor ahead of the reordered sortable entries', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta]
      })

      act(() => {
        result.current.addNew()
      })
      const openDraft = result.current.entries[0]
      const [first, second] = result.current.sortableEntries

      act(() => result.current.reorderSortable([second, first]))

      expect(result.current.entries[0]).toEqual(openDraft)
      expect(result.current.entries.slice(1)).toEqual([second, first])
    })
  })

  describe('restIndex', () => {
    it('is 0 for the pinned featured entry', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: true }
      })

      expect(
        result.current.restIndex(result.current.featuredEntry!)
      ).toBe(0)
    })

    it('offsets non-featured entries past the pinned featured entry', () => {
      const { result } = setup({
        isMulti: true,
        existingItems: [venueFixtureAlpha, venueFixtureBeta],
        featured: { isInitiallyFeatured: true }
      })

      const rest = result.current.entries[1]
      expect(result.current.restIndex(rest)).toBe(1)
    })
  })

  describe('object URL cleanup on unmount', () => {
    it('revokes every saved draft preview url when the picker unmounts', () => {
      const file = new File(['x'], 'a.png', { type: 'image/png' })
      const { result, unmount } = setup({
        isCreateFirst: true,
        validation: makeValidation({ file })
      })
      const draft = result.current.entries[0] as Extract<
        (typeof result.current.entries)[number],
        { kind: 'new' }
      >
      act(() => {
        result.current.saveDraft(draft, 0)
      })
      ;(URL.revokeObjectURL as jest.Mock).mockClear()

      unmount()

      expect(URL.revokeObjectURL).toHaveBeenCalledWith(
        'blob:mock-preview'
      )
    })

    it('does not attempt to revoke entries with no preview url', () => {
      const { unmount } = setup({
        existingItems: [venueFixtureAlpha]
      })

      unmount()

      expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    })
  })
})
