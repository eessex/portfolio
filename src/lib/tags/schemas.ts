import { z } from 'zod'

import { bool, defaultSchema } from '@/lib/schemas'

/**
 * Tag represents a category or label that can be associated with content.
 * Tags can be used to filter and organize content.
 */
export const tagSchema = z.lazy(() =>
  defaultSchema.extend({ isPublished: bool.optional() })
)
