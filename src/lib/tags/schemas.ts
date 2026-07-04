import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { bool, slug } from '@/lib/schemas/primitives'

/**
 * Tag represents a category or label that can be associated with content.
 * Tags can be used to filter and organize content.
 * `name` is a unique, kebab-case slug used for search, filtering, and URLs.
 */
export const tagSchema = z.object({
  ...systemFields,
  name: slug,
  isPublished: bool.optional()
})
