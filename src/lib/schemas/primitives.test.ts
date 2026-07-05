import { z } from 'zod'

import { slug } from '@/lib/schemas/primitives'

describe('shared zod error map', () => {
  it('replaces the default enum-value dump with a friendly, field-named message', () => {
    const schema = z.object({ timezone: z.enum(['a', 'b', 'c']) })
    const result = schema.safeParse({ timezone: 'nope' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        timezone: ['Please select a valid timezone option.']
      })
    }
  })

  it('splits a camelCase field name into words for the enum message', () => {
    const schema = z.object({ contentType: z.enum(['a', 'b']) })
    const result = schema.safeParse({ contentType: 'nope' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        contentType: ['Please select a valid content type option.']
      })
    }
  })

  it("uses slug's own custom message for its regex format hint", () => {
    const schema = z.object({ slug })
    const result = schema.safeParse({ slug: 'Not A Slug!' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        slug: [
          'Can only contain lowercase letters, numbers, and hyphens.'
        ]
      })
    }
  })

  it('falls back to a generic message for a regex field with no custom message', () => {
    const schema = z.object({ code: z.string().regex(/^[0-9]+$/) })
    const result = schema.safeParse({ code: 'abc' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        code: ['Invalid format.']
      })
    }
  })

  it('leaves other default messages untouched', () => {
    const schema = z.object({ slug })
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        slug: ['Required']
      })
    }
  })
})
