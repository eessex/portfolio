/** @jest-environment node */

import { z } from 'zod'

import {
  extractIndexedGroups,
  extractPrefixedGroup,
  formatAuthedApiResponseJSON,
  formatErrorResponse,
  formatValidationResponse,
  normalizeFormData
} from '@/lib/util'

describe('#normalizeFormData', () => {
  it('converts checked checkbox values to true', () => {
    const result = normalizeFormData({ isPublished: 'on' })

    expect(result.isPublished).toBe(true)
  })

  it('converts empty *Date fields to undefined', () => {
    const result = normalizeFormData({ startDate: '' })

    expect(result.startDate).toBeUndefined()
  })

  it('leaves non-empty *Date fields untouched', () => {
    const result = normalizeFormData({ startDate: '2024-01-01' })

    expect(result.startDate).toBe('2024-01-01')
  })

  it('converts other empty string fields to undefined', () => {
    const result = normalizeFormData({ url: '', name: '' })

    expect(result.url).toBeUndefined()
    expect(result.name).toBeUndefined()
  })

  it('leaves non-empty, non-checkbox fields untouched', () => {
    const result = normalizeFormData({
      city: 'Austin',
      count: 3
    })

    expect(result.city).toBe('Austin')
    expect(result.count).toBe(3)
  })

  it('mutates and returns the same object reference', () => {
    const data = { isPublished: 'on' }
    const result = normalizeFormData(data)

    expect(result).toBe(data)
  })

  it('accepts a FormData instance directly', () => {
    const fd = new FormData()
    fd.append('isPublished', 'on')
    fd.append('startDate', '')
    fd.append('title', '')
    fd.append('city', 'Austin')

    const result = normalizeFormData(fd)

    expect(result.isPublished).toBe(true)
    expect(result.startDate).toBeUndefined()
    expect(result.title).toBeUndefined()
    expect(result.city).toBe('Austin')
  })
})

describe('#extractIndexedGroups', () => {
  it('collects existing entries from groups that have an id field', () => {
    const data = {
      'images[0].id': 'image-1',
      'images[1].id': 'image-2',
      title: 'My Project'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      { kind: 'existing', id: 'image-1' },
      { kind: 'existing', id: 'image-2' }
    ])
  })

  it('collects field groups that have no id as new entries', () => {
    const data = {
      'images[0].caption': 'A caption',
      'images[0].alt': 'Alt text'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      {
        kind: 'new',
        fields: { caption: 'A caption', alt: 'Alt text' }
      }
    ])
  })

  it('collects a group with an id AND edited fields as an edited entry', () => {
    const data = {
      'images[0].id': 'image-1',
      'images[0].caption': 'Edited caption',
      'images[0].alt': 'Edited alt'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      {
        kind: 'edited',
        id: 'image-1',
        fields: { caption: 'Edited caption', alt: 'Edited alt' }
      }
    ])
  })

  it('preserves interleaved existing, edited and new entries by index', () => {
    const data = {
      'images[0].caption': 'New image caption',
      'images[1].id': 'image-1',
      'images[2].id': 'image-2',
      'images[2].caption': 'Edited caption'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      { kind: 'new', fields: { caption: 'New image caption' } },
      { kind: 'existing', id: 'image-1' },
      {
        kind: 'edited',
        id: 'image-2',
        fields: { caption: 'Edited caption' }
      }
    ])
  })

  it('preserves the interleaved order of existing and new entries by index', () => {
    const data = {
      'images[0].caption': 'New image caption',
      'images[1].id': 'image-1',
      'images[2].caption': 'Another new image'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      { kind: 'new', fields: { caption: 'New image caption' } },
      { kind: 'existing', id: 'image-1' },
      { kind: 'new', fields: { caption: 'Another new image' } }
    ])
  })

  it('orders entries by index regardless of key insertion order', () => {
    const data = {
      'images[2].id': 'image-3',
      'images[0].id': 'image-1',
      'images[1].id': 'image-2'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([
      { kind: 'existing', id: 'image-1' },
      { kind: 'existing', id: 'image-2' },
      { kind: 'existing', id: 'image-3' }
    ])
  })

  it('returns an empty array when only the marker is present', () => {
    const data = { 'images[]': '' }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([])
  })

  it('deletes matched keys (including the marker) from data', () => {
    const data = {
      'images[]': '',
      'images[0].id': 'image-1',
      title: 'My Project'
    }

    extractIndexedGroups(data, 'images')

    expect(data).toEqual({ title: 'My Project' })
  })

  it('keeps nested field paths whole', () => {
    const data = {
      'publishedEditions[]': '',
      'publishedEditions[0].format': 'LP',
      'publishedEditions[0].publisherId': 'publisher-1',
      'publishedEditions[1].publisher.name': 'Soap Library'
    }

    const result = extractIndexedGroups(data, 'publishedEditions')

    expect(result).toEqual([
      {
        kind: 'new',
        fields: { format: 'LP', publisherId: 'publisher-1' }
      },
      {
        kind: 'new',
        fields: { 'publisher.name': 'Soap Library' }
      }
    ])
    expect(data).toEqual({})
  })

  it("doesn't match a list nested under another prefix", () => {
    const data = {
      'images[0].id': 'image-1',
      'publishedEditions[0].images[0].id': 'image-2'
    }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([{ kind: 'existing', id: 'image-1' }])
    expect(data).toEqual({
      'publishedEditions[0].images[0].id': 'image-2'
    })
  })

  it('ignores keys that do not match the prefix', () => {
    const data = { 'links[0].id': 'link-1', title: 'My Project' }

    const result = extractIndexedGroups(data, 'images')

    expect(result).toEqual([])
    expect(data).toEqual({
      'links[0].id': 'link-1',
      title: 'My Project'
    })
  })
})

describe('#extractPrefixedGroup', () => {
  it('reads an id with no fields as an untouched selection', () => {
    const data = { venueId: 'venue-1', title: 'My Event' }

    const result = extractPrefixedGroup(data, 'venue.', 'venueId')

    expect(result).toEqual({ kind: 'existing', id: 'venue-1' })
  })

  it('reads an id alongside fields as an inline edit', () => {
    const data = {
      venueId: 'venue-1',
      'venue.city': 'Brooklyn',
      'venue.timezone': 'America/New_York'
    }

    const result = extractPrefixedGroup(data, 'venue.', 'venueId')

    expect(result).toEqual({
      kind: 'edited',
      id: 'venue-1',
      fields: { city: 'Brooklyn', timezone: 'America/New_York' }
    })
  })

  it('reads fields with no id as a pending creation', () => {
    const data = { 'venue.city': 'Brooklyn' }

    const result = extractPrefixedGroup(data, 'venue.', 'venueId')

    expect(result).toEqual({
      kind: 'new',
      fields: { city: 'Brooklyn' }
    })
  })

  it('sweeps every prefixed key, including ones outside the schema', () => {
    const data: Record<string, unknown> = {
      title: 'Site title',
      coverImageId: 'image-1',
      'coverImage.file': 'a-file',
      'coverImage.url': 'https://example.com/i.jpg'
    }

    extractPrefixedGroup(data, 'coverImage.', 'coverImageId')

    // the id stays for the parent schema, the fields don't
    expect(data).toEqual({
      title: 'Site title',
      coverImageId: 'image-1'
    })
  })

  it('leaves a different picker of the same item type alone', () => {
    const data = {
      coverImageId: 'image-1',
      'coverImage.caption': 'Cover',
      heroImageId: 'image-2',
      'heroImage.caption': 'Hero'
    }

    const result = extractPrefixedGroup(
      data,
      'coverImage.',
      'coverImageId'
    )

    expect(result).toEqual({
      kind: 'edited',
      id: 'image-1',
      fields: { caption: 'Cover' }
    })
    expect(data).toHaveProperty(['heroImage.caption'], 'Hero')
  })

  it('returns undefined when the picker submitted nothing', () => {
    const result = extractPrefixedGroup(
      { title: 'My Event' },
      'venue.',
      'venueId'
    )

    expect(result).toBeUndefined()
  })
})

describe('#formatErrorResponse', () => {
  it('surfaces the cause message when the error wraps one', () => {
    const err = new Error('Failed to create embed code.', {
      cause: new Error('DB error')
    })

    const response = formatErrorResponse(
      'Failed to save embed code',
      err
    )

    expect(response).toEqual({
      ok: false,
      message: 'Failed to save embed code: DB error.'
    })
  })

  it('falls back to the error message when there is no cause', () => {
    const err = new Error('DB error')

    const response = formatErrorResponse(
      'Failed to delete embed code',
      err
    )

    expect(response).toEqual({
      ok: false,
      message: 'Failed to delete embed code: DB error.'
    })
  })

  it('falls back to a generic message when err is not an Error', () => {
    const response = formatErrorResponse(
      'Failed to save embed code',
      'oops'
    )

    expect(response).toEqual({
      ok: false,
      message: 'Failed to save embed code.'
    })
  })
})

describe('#formatValidationResponse', () => {
  it('builds a response with per-field errors from a ZodError', () => {
    const schema = z.object({ url: z.string() })
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    if (result.success) return

    const response = formatValidationResponse(
      result.error,
      'Failed to validate embed code.'
    )

    expect(response).toEqual({
      ok: false,
      errors: { url: ['Required'] },
      message: 'Failed to validate embed code.'
    })
  })
})

describe('#formatAuthedApiResponseJSON', () => {
  it('returns the body with a private, no-store header', async () => {
    const res = formatAuthedApiResponseJSON({ isAuthed: true })

    expect(await res.json()).toEqual({ isAuthed: true })
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })
})
