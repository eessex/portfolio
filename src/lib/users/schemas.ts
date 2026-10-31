import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { email, shortText } from '@/lib/schemas/primitives'

/**
 * What a user_tokens row's one-time link does: an invite creates a new
 * admin, a reset sets an existing admin's password.
 */
export const userTokenPurposes = ['invite', 'reset'] as const
export const userTokenPurposeSchema = z.enum(userTokenPurposes)

/** NIST SP 800-63B rev. 4 for single-factor passwords */
export const MIN_PASSWORD_LENGTH = 15
export const MAX_PASSWORD_LENGTH = 64

/** bcrypt ignores everything past this many bytes */
export const MAX_PASSWORD_BYTES = 72

// Accented letters and emoji take 2–4 bytes each, so a password under
// MAX_PASSWORD_LENGTH can still be truncated; past the limit, two
// passwords sharing their first 72 bytes would hash the same
function isWithinBcryptLimit(password: string) {
  let bytes = 0
  // UTF-8 width per code point; no TextEncoder in jsdom
  for (const char of password) {
    const code = char.codePointAt(0) ?? 0
    bytes +=
      code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4
  }
  return bytes <= MAX_PASSWORD_BYTES
}

const bcryptLimitMessage =
  'Too long: accented letters and emoji count as several characters. Use a shorter password.'

// .min()/.max() count UTF-16 code units, so an emoji would count twice
function characterCount(password: string) {
  return [...password].length
}

/** A password being set; login still accepts older 8+ ones. */
export const newPassword = z
  .string()
  .refine(
    (password) => characterCount(password) >= MIN_PASSWORD_LENGTH,
    `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  )
  .refine(
    (password) => characterCount(password) <= MAX_PASSWORD_LENGTH,
    `Use at most ${MAX_PASSWORD_LENGTH} characters.`
  )
  .refine(isWithinBcryptLimit, bcryptLimitMessage)

const currentPassword = z.string({
  error: 'Enter your current password.'
})

export const changePasswordSchema = z
  .object({
    currentPassword,
    newPassword,
    confirmPassword: z.string({
      error: 'Confirm your new password.'
    })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword']
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Choose a password different from your current one.',
    path: ['newPassword']
  })

export const changeEmailSchema = z.object({
  currentPassword,
  email
})

export const changeNameSchema = z.object({
  name: shortText.min(1, 'Enter a name.')
})

/**
 * User represents an admin user who can log into the CMS.
 */
export const userSchema = z.object({
  ...systemFields,
  name: shortText,
  email,
  password: z.string().min(8)
})

/**
 * The /setup form's account fields. The setup code itself is checked
 * separately (against its hash, not through Zod) before this runs.
 */
export const completeSetupSchema = z
  .object({
    name: shortText,
    email,
    password: z
      .string()
      .min(8)
      .refine(isWithinBcryptLimit, bcryptLimitMessage),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword']
  })
