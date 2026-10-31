import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { email, shortText } from '@/lib/schemas/primitives'

/**
 * What a user_tokens row's one-time link does: an invite creates a new
 * admin, a reset sets an existing admin's password.
 */
export const userTokenPurposes = ['invite', 'reset'] as const
export const userTokenPurposeSchema = z.enum(userTokenPurposes)

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
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword']
  })
