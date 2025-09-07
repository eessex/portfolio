import type { EmbedCode } from '@/lib/embed-codes/types'
import type {
  AboutContactSchema,
  AboutSchema,
  dashboardImageSchema,
  dashboardLinkSchema,
  EventSchema,
  imageSchema,
  linkSchema,
  ReleaseSchema,
  SettingsSchema
} from '@/lib/scemas'
import type { Venue } from '@/lib/venues/types'
import { type z } from 'zod'

export type PageType = 'event' | 'release'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export type FormResponse<T> = Promise<{
  ok: true
  res?: T | T[]
  message?: string
} | {
  ok?: false
  errors?: Record<string, string[] | undefined> | string[]
  message?: string
} | undefined>

type EmbeddedItemArrayKeys = 'embedCodes' | 'images' | 'links'

interface SavedItemAttributes {
  createdAt?: string
  id: string
}

interface EmbeddedItemArrays {
  embedCodes: EmbedCode[]
  images: Image[]
  links: Link[]
}

export type Image = z.infer<typeof imageSchema>
export type DashboardImage = z.infer<typeof dashboardImageSchema>

export type Link = z.infer<typeof linkSchema>
export type DashboardLink = z.infer<typeof dashboardLinkSchema>

export type Event = z.infer<typeof EventSchema> & SavedItemAttributes

export type EventClient = Omit<Event, 'projectId' | 'venueIds' | 'tagIds' | EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
  venue: Venue,
  slug: string
}

export type Release = z.infer<typeof ReleaseSchema> & SavedItemAttributes

export type ReleaseClient = Omit<Release, EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
  slug: string
}

export type SiteSettings = z.infer<typeof SettingsSchema>

export type SiteSettingsClient = z.infer<typeof SettingsSchema> & {
  coverImage?: Image
}

export type About = z.infer<typeof AboutSchema>
export type AboutContact = z.infer<typeof AboutContactSchema>

export interface AboutClient extends About {
  coverImage?: Image
}
