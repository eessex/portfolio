import { defaultSchema, email, shortText } from '@/lib/schemas'
import { z } from 'zod'

/**
 * User represents an admin user who can log into the CMS.
 */
export const userSchema = defaultSchema.extend({
  name: shortText,
  email,
  password: z.string().min(8)
})
