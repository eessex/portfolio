import { z } from 'zod'

import {
  extractIndexedGroups,
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
