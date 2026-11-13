import type { SiteKind } from '@/lib/projects/site-profile'
import { ABOUT_PATH, ARTISTS_PATH, PagePaths } from '@/lib/schemas'

/**
 * The menubar's possible items, in default order. A site offers either
 * `projects` or `artists` (a label's roster), never both: see
 * `siteNavPaths`.
 */
export const navPaths = [
  PagePaths.events,
  PagePaths.releases,
  PagePaths.projects,
  ARTISTS_PATH,
  ABOUT_PATH
] as const
export type NavPath = (typeof navPaths)[number]

export const MAX_NAV_LABEL_LENGTH = 30

export interface NavItemSetting {
  path: NavPath
  /** blank shows the default, e.g. "Events" */
  label?: string
}

/** The menu of a site that never saved one. */
export const DEFAULT_NAV_ITEMS: NavItemSetting[] = [
  { path: PagePaths.events },
  { path: PagePaths.releases },
  { path: ABOUT_PATH }
]

/** The index a site of this kind lists its projects at */
function projectsNavPath(kind: SiteKind): NavPath {
  return kind === 'label' ? ARTISTS_PATH : PagePaths.projects
}

/** The items a site of this kind offers, in default order */
export function siteNavPaths(kind: SiteKind): NavPath[] {
  const shown = projectsNavPath(kind)
  return navPaths.filter(
    (path) =>
      (path !== PagePaths.projects && path !== ARTISTS_PATH) ||
      path === shown
  )
}

/**
 * A saved menu as this kind of site shows it: a saved `projects` or
 * `artists` item becomes the site's own projects index, so a site
 * whose default project changes type keeps the item in place.
 */
export function siteNavItems(
  kind: SiteKind,
  settings: NavItemSetting[] = DEFAULT_NAV_ITEMS
): NavItemSetting[] {
  const shown = projectsNavPath(kind)
  const items = settings.map((item) =>
    item.path === PagePaths.projects || item.path === ARTISTS_PATH
      ? { ...item, path: shown }
      : item
  )
  // a menu saved with both keeps the first
  return items.filter(
    (item, i) =>
      items.findIndex(({ path }) => path === item.path) === i
  )
}
