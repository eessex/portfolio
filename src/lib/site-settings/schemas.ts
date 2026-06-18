import {
  basePageSchema,
  defaultSchema,
  shortText
} from '@/lib/schemas'
import { hydratedItemIdSchemas } from '@/lib/schemas/hydratedItemIdSchemas'

/**
 * Site settings represent global settings for the site.
 * There should only be one row in the table.
 * These settings are used to populate SEO meta tags and other site-wide settings.
 */
export const siteSettingsSchema = defaultSchema.extend({
  coverImageId: basePageSchema.shape.coverImageId,
  description: shortText,
  title: basePageSchema.shape.title
})

export const siteSettingsClientSchema = siteSettingsSchema.extend(
  hydratedItemIdSchemas.pick({ coverImage: true }).shape
)
