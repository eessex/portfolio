import type { DashboardEmbedCode } from '@/lib/embed-codes/schemas/client'
import type { DashboardImage } from '@/lib/images/schemas/client'
import type { DashboardLink } from '@/lib/links/schemas/client'
import type { ProjectClient } from '@/lib/projects/types'
import type { DashboardPublisher } from '@/lib/publishers/schemas/client'
import {
  ABOUT_PATH,
  type EmbeddedItemType,
  type PagePath,
  PagePaths
} from '@/lib/schemas'
import { camelToSnake } from '@/lib/strings'
import type { PageItemClient } from '@/lib/types'
import type { DashboardVenue } from '@/lib/venues/schemas/client'

/**
 * A fetched embedded item extended with the pages that embed it,
 * used by dashboard listings (e.g. `usedOnPages()`).
 */
type DashboardItem =
  | DashboardEmbedCode
  | DashboardImage
  | DashboardLink
  | DashboardPublisher
  | DashboardVenue

function eventUrl(slug: string) {
  return pageItemUrl(PagePaths.events, slug)
}

function releaseUrl(slug: string) {
  return pageItemUrl(PagePaths.releases, slug)
}

function projectUrl(slug: string) {
  return pageItemUrl(PagePaths.projects, slug)
}

export function pageItemUrl(pagePath: PagePath, slug: string) {
  return `/${pagePath}/${slug}`
}

export function itemUrl(item: PageItemClient) {
  if ((item as ProjectClient).isDefaultProject)
    return `/${ABOUT_PATH}`
  return pageItemUrl(item.path, item.slug)
}

export function itemEditUrl(item: PageItemClient) {
  return editUrl(itemUrl(item))
}

/** An embedded item type's dashboard list, e.g. `/dashboard/embed_codes` */
export function dashboardUrl(itemType: EmbeddedItemType) {
  return `/dashboard/${camelToSnake(itemType)}`
}

export function dashboardItemEditUrl(
  itemType: EmbeddedItemType,
  id: string
) {
  return editUrl(`${dashboardUrl(itemType)}/${id}`)
}

/** An item page's or dashboard item's edit form */
export function editUrl(url: string) {
  return `${url}/edit`
}

/** A page type's or dashboard list's create form */
export function newUrl(url: string) {
  return `${url}/new`
}

export function isEditOrNewUrl(pathname: string) {
  return /\/(edit|new)$/.test(pathname)
}

export function usedOnPages(item: Partial<DashboardItem>) {
  const events =
    'eventSlugs' in item && Array.isArray(item.eventSlugs)
      ? item.eventSlugs.map((i) => eventUrl(i))
      : []
  const projects =
    'projectSlugs' in item && Array.isArray(item.projectSlugs)
      ? item.projectSlugs.map((i) => projectUrl(i))
      : []
  const releases =
    'releaseSlugs' in item && Array.isArray(item.releaseSlugs)
      ? item.releaseSlugs.map((i) => releaseUrl(i))
      : []
  return [...events, ...releases, ...projects]
}
