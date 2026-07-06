import type { EmbedCode } from '@/lib/embed-codes/schemas/db'
import type {
  EventClient,
  FetchEventsResult
} from '@/lib/events/types'
import type { Image } from '@/lib/images/schemas/db'
import type { Link } from '@/lib/links/schemas/db'
import type {
  FetchProjectsResult,
  ProjectClient
} from '@/lib/projects/types'
import type { PublishedEdition } from '@/lib/published-editions/schemas/db'
import type {
  FetchReleasesResult,
  ReleaseClient
} from '@/lib/releases/types'
import type { Venue } from '@/lib/venues/schemas/db'

export type PageDataResponse =
  | FetchEventsResult
  | FetchProjectsResult
  | FetchReleasesResult
export type PageDataResponseKey =
  | keyof FetchEventsResult
  | keyof FetchProjectsResult
  | keyof FetchReleasesResult

export type PageItemClient =
  | EventClient
  | ProjectClient
  | ReleaseClient

export interface PageItemResponseWithCursor<
  T extends PageItemClient,
  S extends PageDataResponse
> {
  res: Record<keyof S, T[]>
  nextCursor: string | null
  totalCount: number
}

export type PageItemProps = {
  params: Promise<{ slug: string }>
}

export type PageEmbeddedItemProps = {
  params: Promise<{ id: string }>
}

export type EmbeddedItem =
  | EmbedCode
  | Image
  | Link
  | PublishedEdition
  | Venue

// FIXME: multiple not yet used, but some endpoints might need it
export type FormState<T, Multiple extends boolean = false> = {
  ok: boolean
  res?: Multiple extends true ? T[] : T
  message?: string
  errors?: Record<string, string[] | undefined> | string[]
}

export type FormResponse<T, Multiple extends boolean = false> =
  | FormState<T, Multiple>
  | undefined

export interface Badge {
  text: string
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red'
}
