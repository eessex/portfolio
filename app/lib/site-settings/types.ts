import type { z } from 'zod'

import type { siteSettingsClientSchema, siteSettingsSchema } from '@/lib/site-settings/schemas'

export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type SiteSettingsClient = z.infer<typeof siteSettingsClientSchema>
