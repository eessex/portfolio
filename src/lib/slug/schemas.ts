import { z } from 'zod'

import { systemFields } from '@/lib/schemas/fields'
import { shortText, slug, uuid } from '@/lib/schemas/primitives'

/**
 * Tracks a row's previous slug for SEO and redirect purposes.
 * Written by the `save_old_slug` trigger whenever a row's slug changes.
 */
export const slugHistorySchema = z.object({
  id: systemFields.id,
  createdAt: systemFields.createdAt,
  tableName: shortText.max(50),
  rowId: uuid,
  oldSlug: slug
})
export type SlugHistory = z.infer<typeof slugHistorySchema>
