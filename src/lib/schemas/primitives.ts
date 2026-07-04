import { z } from 'zod'

export const MAX_STRING_LENGTH_LONG = 5000
export const MAX_STRING_LENGTH_SHORT = 255

export const uuid = z.string().uuid()
export const uuidArray = z.array(uuid)

export const shortText = z.string().max(MAX_STRING_LENGTH_SHORT)

export const longText = z.string().max(MAX_STRING_LENGTH_LONG)

export const email = z.string().email()

export const bool = z.boolean()

export const url = z.string().url().max(MAX_STRING_LENGTH_SHORT)

export const slug = shortText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const slugArray = z.array(slug)

// FIXME: move preprocess out of primitives
/** Handle nested dates in jsonb objects or a real date */
export const date = z.preprocess((val) => {
  if (typeof val === 'string' || val instanceof Date) {
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }
  return val
}, z.date())
