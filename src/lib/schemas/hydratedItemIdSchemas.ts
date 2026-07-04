import z from 'zod'

import { embedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { projectSchema } from '@/lib/projects/schemas'
import { publishedEditionSchema } from '@/lib/published-editions/schemas'
import { tagSchema } from '@/lib/tags/schemas'
import { venueSchema } from '@/lib/venues/schemas/db'

/**
 * @deprecated
 * IDs of items that can be embedded within pages,
 * their metadata will be included when fetching a page.
 */
export const hydratedItemIdSchemas = z.object({
  coverImage: z.lazy(() => imageSchema).optional(),
  embedCodes: z.lazy(() => embedCodeSchema.array()).optional(),
  featuredEmbedCode: z.lazy(() => embedCodeSchema).optional(),
  images: z.lazy(() => imageSchema.array()).optional(),
  links: z.lazy(() => linkSchema.array()).optional(),
  project: z.lazy(() => projectSchema).optional(),
  publishedEditions: z
    .lazy(() => publishedEditionSchema.array())
    .optional(),
  tags: z.lazy(() => tagSchema.array()).optional(),
  venue: z.lazy(() => venueSchema).optional()
})
