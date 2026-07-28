import { z } from 'zod'

import { imageSchema } from '@/lib/images/schemas/db'
import { linkSchema } from '@/lib/links/schemas/db'
import { publishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { publisherSchema } from '@/lib/publishers/schemas/db'
import { releaseClientSchema } from '@/lib/releases/schemas'
import { relationSlugArrays } from '@/lib/schemas/fields'
import { date, shortText } from '@/lib/schemas/primitives'

/**
 * Extends `publishedEditionSchema` with the related items hydrated
 * by `build_published_edition_json` in SQL.
 */
export const publishedEditionClientSchema =
  publishedEditionSchema.extend({
    buyLink: linkSchema.optional(),
    coverImage: imageSchema.optional(),
    images: imageSchema.array().optional(),
    publisher: publisherSchema.optional(),
    // Flat sort/cursor key — `runListFetch`'s cursor value must be a
    // top-level field, so it can't point at the nested `publisher` object.
    publisherName: shortText.optional()
  })
export type PublishedEditionClient = z.infer<
  typeof publishedEditionClientSchema
>

/**
 * Extends `publishedEditionClientSchema` with the parent release's
 * id/title/artist/type/coverImageId/coverImage (`release`) and slug
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
        artist: true,
        type: true,
        coverImage: true
      })
    ),
    releaseSlugs: relationSlugArrays.releaseSlugs,
    // Flat sort/cursor key (the parent release's release date, distinct
    // from this edition's own `publishDate`) — `runListFetch`'s cursor
    // value must be a top-level field, so it can't point at the nested
    // `release` object. Editions of the same release share this value,
    // which keeps them adjacent when the list is sorted by it.
    releaseDate: date.optional()
  })
export type DashboardPublishedEdition = z.infer<
  typeof dashboardPublishedEditionSchema
>
