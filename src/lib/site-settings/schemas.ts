import { z } from 'zod'

import { imageSchema } from '@/lib/images/schemas/db'
import { relationFields, systemFields } from '@/lib/schemas/fields'
import { shortText } from '@/lib/schemas/primitives'

/**
 * Site settings represent global settings for the site.
 * There should only be one row in the table.
 * These settings are used to populate SEO meta tags and other site-wide settings.
 */
export const siteSettingsSchema = z.object({
  ...systemFields,
  coverImageId: relationFields.coverImageId,
  description: shortText.optional(),
  title: shortText.optional()
})

export const siteSettingsClientSchema = siteSettingsSchema.extend({
  coverImage: z.lazy(() => imageSchema).optional()
})
