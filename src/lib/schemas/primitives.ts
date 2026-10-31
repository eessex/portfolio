import { z } from 'zod'

import { camelToSentence } from '@/lib/strings'

/**
 * Zod's default enum message dumps every allowed option into the text
 * (unreadable for fields like `venueTimezoneSchema`'s ~28 zones).
 * Regex failures (e.g. `slug` below) should set their own specific message
 * via `.regex(pattern, message)`, which takes priority over this map — this
 * only provides a generic fallback for any regex validator that doesn't.
 * Returning `undefined` falls through to Zod's default message.
 */
z.config({
  customError: (issue) => {
    // v3's wording, which forms and tests rely on
    if (issue.input === undefined) return 'Required'
    if (issue.code === 'invalid_value') {
      const key = issue.path?.[issue.path.length - 1]
      const fieldName =
        typeof key === 'string'
          ? camelToSentence(key).toLowerCase()
          : 'field'
      return `Please select a valid ${fieldName} option.`
    }
    if (issue.code === 'invalid_format' && issue.format === 'regex') {
      return 'Invalid format.'
    }
    return undefined
  }
})

export const MAX_STRING_LENGTH_LONG = 5000
export const MAX_STRING_LENGTH_SHORT = 255

export const uuid = z.string().uuid()
export const uuidArray = z.array(uuid)

export const shortText = z.string().max(MAX_STRING_LENGTH_SHORT)

export const longText = z.string().max(MAX_STRING_LENGTH_LONG)

export const email = z.string().email()

export const bool = z.boolean()

export const url = z.string().url().max(MAX_STRING_LENGTH_SHORT)

function urlProtocol(value: string) {
  try {
    return new URL(value).protocol
  } catch {
    return undefined
  }
}

export function isHttpsUrl(value: string) {
  return urlProtocol(value) === 'https:'
}

export const httpsUrlMessage =
  'Use a secure URL starting with https://.'
/** An `<input pattern>` matching `httpsUrl`; patterns are case-sensitive. */
export const httpsUrlPattern = '[Hh][Tt][Tt][Pp][Ss]://.+'

// a non-url is left to `url`'s message alone
export const httpsUrl = url.refine(
  (value) => urlProtocol(value) === undefined || isHttpsUrl(value),
  httpsUrlMessage
)

export const slug = shortText.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Can only contain lowercase letters, numbers, and hyphens.'
)
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
