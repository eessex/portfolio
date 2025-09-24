import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import type {
  embeddedItemTypes,
  pagePathTypes
} from '@/lib/schemas'

export type PagePathType = typeof pagePathTypes[number]

export type PageDataResponse = FetchEventsResult | FetchReleasesResult

export type PageDataResponseKey
  = keyof FetchEventsResult
  | keyof FetchReleasesResult

export type PageItemClient = EventClient | ReleaseClient

export type EmbeddedItemType = typeof embeddedItemTypes[number]

export type FormState<T> = {
  ok?: boolean
  res?: T | T[]
  message?: string
  errors?: Record<string, string[] | undefined> | string[]
}

export type FormResponse<T> = Promise<FormState<T> | undefined>

export interface Badge { text: string, color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' }
