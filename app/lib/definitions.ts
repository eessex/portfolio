import { type z } from 'zod'
import type {
  AboutSchema,
  EmbedCodeSchema,
  EventSchema,
  ImageSchema,
  LinkSchema,
  ReleaseSchema,
  SettingsSchema
} from './scemas'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface Venue {
  id: string
  address?: string
  city: string
  country?: string
  name?: string
  state?: string
  url?: string
}

export interface Image extends z.infer<typeof ImageSchema> {
  createdAt?: string
  id: string
}

export interface Link extends z.infer<typeof LinkSchema> {
  createdAt?: string
  id: string
}

type EmbeddedItemArrayKeys = 'embedCodes' | 'images' | 'links'

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
  venue: Venue
}

export type Release = z.infer<typeof ReleaseSchema> & {
  createdAt?: string
}

export type ReleaseClient = Omit<Release, EmbeddedItemArrayKeys> & EmbeddedItemArrays

export type SiteSettings = z.infer<typeof SettingsSchema>

export type SiteSettingsClient = z.infer<typeof SettingsSchema> & {
  coverImage?: Image
}

export type About = z.infer<typeof AboutSchema>

export interface AboutClient extends About {
  coverImage?: Image
}
