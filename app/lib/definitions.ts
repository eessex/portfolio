import { type z } from 'zod'
import type {
  EmbedCodeSchema,
  EventSchema,
  ImageSchema,
  LinkSchema,
  ReleaseSchema
} from './scemas'

export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface SiteSettings {
  id: string
  coverImageId?: string,
  description?: string,
  title: string,
}

export interface SiteSettingsClient extends SiteSettings {
  coverImage?: Image
}

export interface About {
  id: string
  coverImageId?: string,
  description?: string,
  slug: string,
  title?: string,
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
