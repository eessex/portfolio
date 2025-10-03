import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import type {
  embeddedItemTypes,
  pagePathTypes
} from '@/lib/schemas'

export type PagePathType = typeof pagePathTypes[number]

export type PageDataResponse = FetchEventsResult | FetchProjectsResult | FetchReleasesResult
export type PageDataResponseKey
  = keyof FetchEventsResult
  | keyof FetchProjectsResult
  | keyof FetchReleasesResult

export type PageItemClient = EventClient | ProjectClient | ReleaseClient

export type PageItemProps = {
  params: Promise<{ slug: string }>
}

export type EmbeddedItemType = typeof embeddedItemTypes[number]

export type FormState<T> = {
  ok?: boolean
  res?: T | T[]
  message?: string
  errors?: Record<string, string[] | undefined> | string[]
}

export type FormResponse<T> = Promise<FormState<T> | undefined>

export interface Badge { text: string, color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' }
