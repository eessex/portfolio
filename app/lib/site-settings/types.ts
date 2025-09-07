import { siteSettingsClientSchema, siteSettingsSchema } from '@/lib/site-settings/schemas'
import type { z } from 'zod'

export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type SiteSettingsClient = z.infer<typeof siteSettingsClientSchema>
