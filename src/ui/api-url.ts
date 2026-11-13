import type { ProjectsOrderBy } from '@/lib/projects/schemas'

/**
 * Params a caller may forward to a client API.
 */
export type SearchParams = {
  /** Scope fetches to a parent project (e.g. on project pages) */
  projectId?: string
  /** Restrict images to a type, e.g. 'press' for the press-photo pickers */
  type?: string
  /** Restrict links to press (`true`) or non-press (`false`) links */
  isPress?: boolean
  /** Leave out the default project (the `/projects` index) */
  isDefaultExcluded?: boolean
  /** Leave out SVG images, outside the site icon and logo pickers */
  isSvgExcluded?: boolean
  /** Restrict projects to these types, comma-separated (`/artists`) */
  types?: string
  /** Leave out these project types, comma-separated (label `/about`) */
  excludedTypes?: string
  /** A project list's order, e.g. `name` for `/artists` */
  orderBy?: ProjectsOrderBy
}

type UrlParams = {
  query?: string
  cursor?: string
} & SearchParams

export function buildApiUrl(endpoint: string, params?: UrlParams) {
  const searchParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
  }

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}
