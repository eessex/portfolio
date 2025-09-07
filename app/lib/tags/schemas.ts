import { bool, defaultSchema } from '@/lib/scemas'

/**
 * Tag represents a category or label that can be associated with content.
 * Tags can be used to filter and organize content.
 */
export const tagSchema = defaultSchema.extend({
  isPublished: bool.optional()
})
