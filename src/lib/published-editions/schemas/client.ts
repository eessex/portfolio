import type { z } from 'zod'

import { publishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publisherSchema } from '@/lib/publishers/schemas/db'

/**
 * Extends `publishedEditionSchema` with the publisher hydrated by
 * `build_published_edition_json` in SQL.
 */
export const publishedEditionClientSchema =
  publishedEditionSchema.extend({
    publisher: publisherSchema.optional()
  })
export type PublishedEditionClient = z.infer<
  typeof publishedEditionClientSchema
>
