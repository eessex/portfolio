import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { bool } from '@/lib/schemas/primitives'

/**
 * Tag represents a category or label that can be associated with content.
 * Tags can be used to filter and organize content.
 */
export const tagSchema = z.object({
  ...systemFields,
  isPublished: bool.optional()
})
