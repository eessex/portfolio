import type z from 'zod'

import { publisherSchema } from '@/lib/publishers/schemas/db'
import { relationSlugArrays } from '@/lib/schemas/fields'

/**
 * Extends `publisherSchema` with the pages that embed it.
 * Publishers are only ever linked to releases (via published
 * editions), so unlike other embedded items, `eventSlugs`/
 * `projectSlugs` are never populated.
 */
export const dashboardPublisherSchema = publisherSchema.extend({
  eventSlugs: relationSlugArrays.eventSlugs.optional(),
  projectSlugs: relationSlugArrays.projectSlugs.optional(),
  releaseSlugs: relationSlugArrays.releaseSlugs
})
export type DashboardPublisher = z.infer<
  typeof dashboardPublisherSchema
>
