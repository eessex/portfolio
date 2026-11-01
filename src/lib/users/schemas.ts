import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { email, shortText, uuid } from '@/lib/schemas/primitives'

/**
 * What a user_tokens row's one-time link does: an invite creates a new
 * admin, a reset sets an existing admin's password.
 */
export const userTokenPurposes = ['invite', 'reset'] as const
export const userTokenPurposeSchema = z.enum(userTokenPurposes)

/** Invite and reset links work once, within this many hours */
export const USER_TOKEN_TTL_HOURS = 72

/** generateUserToken()'s shape: 32 bytes as base64url */
export const USER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

/** Codes per set; client-safe, unlike src/lib/auth/recovery-codes.ts */
export const RECOVERY_CODE_COUNT = 8

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

/** Adds a confirm field that must match `passwordKey` */
function withPasswordConfirmation<
  Shape extends z.ZodRawShape,
  Key extends keyof Shape & string
>(shape: Shape, passwordKey: Key, confirmError: string) {
  return z
    .object({
      ...shape,
      confirmPassword: z.string({ error: confirmError })
    })
    .refine(
      (data) => {
        const fields = data as Record<string, unknown>
        return fields[passwordKey] === fields.confirmPassword
      },
      { message: 'Passwords must match.', path: ['confirmPassword'] }
    )
}

const currentPassword = z.string({
  error: 'Enter your current password.'
})

export const changePasswordSchema = withPasswordConfirmation(
  {
    currentPassword,
    newPassword
  },
  'newPassword',
  'Confirm your new password.'
).refine((data) => data.newPassword !== data.currentPassword, {
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
export const completeSetupSchema = withPasswordConfirmation(
  {
    name: shortText,
    email,
    password: newPassword
  },
  'password',
  'Confirm your password.'
)

export const regenerateRecoveryCodesSchema = z.object({
  currentPassword
})

/** /forgot-password: trades one recovery code for a new password. */
export const recoverAccountSchema = withPasswordConfirmation(
  {
    email,
    code: z.string({ error: 'Enter a recovery code.' }),
    newPassword
  },
  'newPassword',
  'Confirm your new password.'
)

/** Users page: invite, reset-link and remove all re-check the password */
export const inviteUserSchema = z.object({ currentPassword })

export const otherUserSchema = z.object({
  currentPassword,
  userId: uuid
})

export const revokeInviteSchema = z.object({ inviteId: uuid })

const token = z
  .string({ error: 'This link is incomplete.' })
  .regex(USER_TOKEN_PATTERN, 'This link is incomplete.')

/** /invite: the invitee sets up their own account. */
export const acceptInviteSchema = withPasswordConfirmation(
  {
    token,
    name: shortText.min(1, 'Enter a name.'),
    email,
    newPassword
  },
  'newPassword',
  'Confirm your password.'
)

/** /reset-password: a reset link from another admin. */
export const resetPasswordSchema = withPasswordConfirmation(
  {
    token,
    newPassword
  },
  'newPassword',
  'Confirm your new password.'
)
