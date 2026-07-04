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
