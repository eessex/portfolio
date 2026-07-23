import { z } from 'zod'

import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { publishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { releaseClientSchema } from '@/lib/releases/schemas'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `publishedEditionSchema` with the related items hydrated
 * by `build_published_edition_json` in SQL.
 */
export const publishedEditionClientSchema =
  publishedEditionSchema.extend({
    buyLink: linkSchema.optional(),
    coverImage: imageSchema.optional(),
    images: imageSchema.array().optional()
  })
export type PublishedEditionClient = z.infer<
  typeof publishedEditionClientSchema
>

/**
 * Extends `publishedEditionClientSchema` with the parent release's
 * id/title/type/coverImageId/coverImage (`release`) and slug
 * (`releaseSlugs`). Unlike other embedded items (many:many with pages
 * via join tables), a published edition belongs to exactly one
 * release, so `releaseSlugs` is always a single-element array — this
 * reuses the existing `usedOnPages()` "Visible on:" convention without
 * inventing a separate single-relation display mechanism.
 */
export const dashboardPublishedEditionSchema =
  publishedEditionClientSchema.extend({
    release: z.lazy(() =>
      releaseClientSchema.pick({
        id: true,
        title: true,
        type: true,
        coverImageId: true,
        coverImage: true
      })
    ),
    releaseSlugs: relationSlugArrays.releaseSlugs
  })
export type DashboardPublishedEdition = z.infer<
  typeof dashboardPublishedEditionSchema
>
