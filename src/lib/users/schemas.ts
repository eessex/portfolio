import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { email, shortText } from '@/lib/schemas/primitives'

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
