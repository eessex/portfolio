import { type z } from 'zod'
import type {
  EmbedCodeSchema,
  ImageSchema,
  LinkSchema
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

export interface Release {
  artist: string
  buyLink?: string
  description?: string
  embedCodeIds?: string[]
  format: string
  id: string
  imageIds: string[]
  isCollaboration?: boolean
  isCompilation?: boolean
  isFeature?: boolean
  isPublished: boolean
  isSingle?: boolean
  label?: string
  linkIds?: string[]
  releaseDate: string
  slug: string
  streamLink?: string
  title: string
}

export interface ReleaseClient extends Omit<Release, 'embedCodeIds' | 'imageIds' | 'linkIds'> {
  embedCodes: EmbedCode[],
  images: Image[],
  links: Link[]
}

/** Data returned to client */
export interface EventClient extends Omit<Event,
  'venueId' | 'imageIds' | 'linkIds' | 'projectIds'
> {
  venue: Omit<Venue, 'id'>
  images: Omit<Image, 'id'>[]
  links: Link[]
}

export type EmbedCode = z.infer<typeof EmbedCodeSchema> & {
  createdAt?: string
}

/** DB schema */
export interface Event {
  _id: string
  id: string
  createdAt: string
  endDate?: string
  embedCodeIds: string[]
  description?: string
  imageIds: string[]
  isAllDay?: boolean
  isPublished: boolean
  linkIds: string[]
  projectIds: string[]
  slug: string
  startDate: string
  ticketLink?: string
  title: string
  updatedAt?: string
  venueId: string
}
