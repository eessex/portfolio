import { type z } from 'zod'
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

export type FormResponse<T> = Promise<{
  ok: boolean;
  res?: T | T[]
} | {
  errors: Record<string, string[] | undefined> | string[],
  message: string
} | undefined>

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Venue extends z.infer<typeof VenueSchema> {
  id: string
  eventSlugs?: string[]
}

export interface Image extends z.infer<typeof ImageSchema> {
  createdAt?: string
  id: string
  eventSlugs?: string[]
  releaseSlugs?: string[]
}

export interface Link extends z.infer<typeof LinkSchema> {
  createdAt?: string
  id: string
  eventSlugs?: string[]
  releaseSlugs?: string[]
}

export type EmbeddedItemArrayKeys = 'embedCodes' | 'images' | 'links'

interface EmbeddedItemArrays {
  embedCodes: EmbedCode[]
  images: Image[]
  links: Link[]
}

export type EmbedCode = z.infer<typeof EmbedCodeSchema> & {
  createdAt?: string
  eventSlugs?: string[]
  releaseSlugs?: string[]
}

export type Event = z.infer<typeof EventSchema> & {
  createdAt?: string
}

export type EventClient = Omit<Event, 'projectIds' | 'venueIds' | EmbeddedItemArrayKeys> & EmbeddedItemArrays & {
  venue: Venue,
  slug: string
}

export type Release = z.infer<typeof ReleaseSchema> & {
  createdAt?: string
}

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
