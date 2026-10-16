import { z } from 'zod'

import { auth } from '@/auth'
import {
  resolveItemId,
  resolveOrderedIds,
  runFormAction,
  saveItemFromFields
} from '@/lib/form-action'
import { formDataFromObject } from '@/test/helpers'

const schema = z.object({ title: z.string() })

function runWith(
  overrides: Partial<Parameters<typeof runFormAction>[0]> = {}
) {
  return runFormAction({
    formData: formDataFromObject({ title: 'A project' }),
    schema,
    itemType: 'projects',
    save: jest.fn(async () => undefined),
    invalidate: jest.fn(),
    ...overrides
  })
}

describe('runFormAction', () => {
  it('returns a { ok: false } error instead of rejecting when prepare throws', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const save = jest.fn(async () => undefined)

    const res = await runWith({
      prepare: async () => {
        throw new Error('Upload failed')
      },
      save
    })

    expect(res).toEqual({
      ok: false,
      message: 'Failed to save project: Upload failed.'
    })
    expect(save).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to prepare projects:',
      expect.any(Error)
    )
    consoleError.mockRestore()
  })

  it('passes prepared data through to save on success', async () => {
    const save = jest.fn(async () => undefined)

    const res = await runWith({
      prepare: async (data) => ({ ...data, title: 'Prepared' }),
      save
    })

    expect(res).toEqual({ ok: true })
    expect(save).toHaveBeenCalledWith({ title: 'Prepared' })
  })
})

describe('saveItemFromFields', () => {
  it('rejects an unauthenticated caller before saving', async () => {
    const mockAuth = auth as unknown as jest.Mock
    mockAuth.mockResolvedValueOnce(null)
    const create = jest.fn(async () => ({ id: 'new' }))
    const update = jest.fn(async () => ({ id: 'existing' }))

    await expect(
      saveItemFromFields({
        id: 'existing',
        fields: { title: 'A project' },
        schema,
        itemType: 'projects',
        create,
        update
      })
    ).rejects.toThrow('Unauthorized')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })
})

describe('resolveItemId', () => {
  const save = jest.fn(async (_fields, id?: string) => ({
    id: id ?? 'created-id'
  }))

  beforeEach(() => save.mockClear())

  it('passes an untouched selection through without saving', async () => {
    const id = await resolveItemId(
      { venueId: 'venue-1' },
      'venueId',
      save
    )

    expect(id).toBe('venue-1')
    expect(save).not.toHaveBeenCalled()
  })

  it('updates when an id arrives alongside edited fields', async () => {
    const id = await resolveItemId(
      { venueId: 'venue-1', 'venue.city': 'Brooklyn' },
      'venueId',
      save
    )

    expect(id).toBe('venue-1')
    expect(save).toHaveBeenCalledWith({ city: 'Brooklyn' }, 'venue-1')
  })

  it('creates from fields submitted with no id', async () => {
    const id = await resolveItemId(
      { 'venue.city': 'Brooklyn' },
      'venueId',
      save
    )

    expect(id).toBe('created-id')
    expect(save).toHaveBeenCalledWith({ city: 'Brooklyn' })
  })

  it('ignores an opened-but-untouched create form', async () => {
    const id = await resolveItemId(
      { 'venue.city': '', 'venue.name': '  ' },
      'venueId',
      save
    )

    expect(id).toBeUndefined()
    expect(save).not.toHaveBeenCalled()
  })

  it('derives both the id key and the prefix from the id field name', async () => {
    const data = {
      heroImageId: 'image-2',
      'heroImage.caption': 'Hero',
      coverImageId: 'image-1'
    }

    const id = await resolveItemId(data, 'heroImageId', save)

    expect(id).toBe('image-2')
    expect(save).toHaveBeenCalledWith({ caption: 'Hero' }, 'image-2')
    expect(data.coverImageId).toBe('image-1')
  })
})

describe('resolveOrderedIds', () => {
  const save = jest.fn(
    async (fields: Record<string, unknown>, id?: string) => ({
      id: id ?? `created-${fields.caption}`
    })
  )

  beforeEach(() => save.mockClear())

  it('preserves submitted order across existing, edited and new entries', async () => {
    const ids = await resolveOrderedIds(
      {
        'images[0].id': 'image-1',
        'images[1].id': 'image-2',
        'images[1].caption': 'Edited',
        'images[2].caption': 'Brand new'
      },
      'images',
      save
    )

    expect(ids).toEqual(['image-1', 'image-2', 'created-Brand new'])
    expect(save).toHaveBeenCalledTimes(2)
  })

  it('drops untouched blank create forms', async () => {
    const ids = await resolveOrderedIds(
      { 'images[0].caption': '', 'images[0].alt': '' },
      'images',
      save
    )

    expect(ids).toEqual([])
    expect(save).not.toHaveBeenCalled()
  })
})
