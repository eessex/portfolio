import type {
  AboutSchema,
  EmbedCodeSchema,
  EventSchema,
  ImageSchema,
  LinkSchema,
  ReleaseSchema,
  SettingsSchema,
  VenueSchema
} from '@/lib/scemas'
import { type z } from 'zod'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export type FormResponse<T> = Promise<{
  ok: boolean;
  res?: T | T[]
} | {
  errors: Record<string, string[] | undefined> | string[],
  message: string
} | undefined>

export interface Venue extends z.infer<typeof VenueSchema> {
  id: string
  eventSlugs?: string[]
}

type EmbeddedItemArrayKeys = 'embedCodes' | 'images' | 'links'

interface SavedItemAttributes {
  createdAt?: string
  id: string
  eventSlugs?: string[]
  releaseSlugs?: string[]
}

interface EmbeddedItemSlugs {
  eventSlugs?: string[]
  releaseSlugs?: string[]
}

interface EmbeddedItemArrays {
  embedCodes: EmbedCode[]
  images: Image[]
  links: Link[]
}

export type EmbedCode = z.infer<typeof EmbedCodeSchema> & EmbeddedItemSlugs & SavedItemAttributes

export type Image = z.infer<typeof ImageSchema> & EmbeddedItemSlugs & SavedItemAttributes

export type Link = z.infer<typeof LinkSchema> & EmbeddedItemSlugs & SavedItemAttributes

export type Event = z.infer<typeof EventSchema> & SavedItemAttributes

export type EventClient = Omit<Event, 'projectIds' | 'venueIds' | EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
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

export interface AboutClient extends About {
  coverImage?: Image
}
