import type { EmbedCode } from '@/lib/embed-codes/types'
import type { Image } from '@/lib/images/types'
import type { Link } from '@/lib/links/types'
import type {
  AboutContactSchema,
  AboutSchema,
  EventSchema,
  ReleaseSchema
} from '@/lib/scemas'
import { siteSettingsSchema } from '@/lib/site-settings/schemas'
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

export type Event = z.infer<typeof EventSchema> & SavedItemAttributes

export type EventClient = Omit<Event, 'projectId' | 'venueIds' | 'tagIds' | EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
  venue: Venue,
  slug: string
}

export type Release = z.infer<typeof ReleaseSchema> & SavedItemAttributes

export type ReleaseClient = Omit<Release, EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
  slug: string
}

export type SiteSettings = z.infer<typeof siteSettingsSchema>

export type SiteSettingsClient = z.infer<typeof siteSettingsSchema> & {
  coverImage?: Image
}

export type About = z.infer<typeof AboutSchema>
export type AboutContact = z.infer<typeof AboutContactSchema>

export interface AboutClient extends About {
  coverImage?: Image
}
