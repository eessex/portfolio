import type { z } from 'zod'

import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { publishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publisherSchema } from '@/lib/publishers/schemas/db'

/**
 * Extends `publishedEditionSchema` with the related items hydrated
 * by `build_published_edition_json` in SQL.
 */
export const publishedEditionClientSchema =
  publishedEditionSchema.extend({
    buyLink: linkSchema.optional(),
    coverImage: imageSchema.optional(),
    images: imageSchema.array().optional(),
    publisher: publisherSchema.optional()
  })
export type PublishedEditionClient = z.infer<
  typeof publishedEditionClientSchema
>
