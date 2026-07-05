import { z } from 'zod'

import {
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
})

describe('#formatErrorResponse', () => {
  it('surfaces the cause message when the error wraps one', () => {
    const err = new Error('Failed to create embed code.', {
      cause: new Error('DB error')
    })

    const response = formatErrorResponse(
      'Failed to edit embed code',
      err
    )

    expect(response).toEqual({
      ok: false,
      message: 'Failed to edit embed code: DB error.'
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
      'Failed to edit embed code',
      'oops'
    )

    expect(response).toEqual({
      ok: false,
      message: 'Failed to edit embed code.'
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
