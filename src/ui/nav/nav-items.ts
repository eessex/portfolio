import { ARTIST_LABEL, ARTISTS_LABEL } from '@/lib/projects/labels'
import type { SiteKind } from '@/lib/projects/site-profile'
import {
  ABOUT_PATH,
  ARTISTS_PATH,
  itemTypeToLabel,
  PagePaths
} from '@/lib/schemas'
import {
  type NavItemSetting,
  type NavPath,
  navPaths,
  siteNavItems
} from '@/lib/site-settings/nav-paths'
import { formattedItemType } from '@/ui/format/items'
import { editUrl, newUrl } from '@/ui/routes'

export { type NavPath, navPaths }

/** What an item is called without a custom label */
export function defaultNavLabel(navPath: NavPath) {
  switch (navPath) {
    case ABOUT_PATH:
      return 'About'
    case ARTISTS_PATH:
      return ARTISTS_LABEL
    default:
      return formattedItemType(navPath, false, true).trim()
  }
}

function navItem(navPath: NavPath, label?: string) {
  return {
    navPath,
    href: `/${navPath}`,
    label: label || defaultNavLabel(navPath)
  }
}

/** Every possible item, with its default label */
export const navItems = navPaths.map((navPath) => navItem(navPath))

/**
 * The saved menu, or the default one, as items in order. Every item
 * shows its default label until custom labels can change the route.
 */
export function navItemsFromSettings(
  kind: SiteKind,
  settings?: NavItemSetting[]
) {
  return siteNavItems(kind, settings).map(({ path }) => navItem(path))
}

/** drafts and empty are shown to admins only */
export type NavItemStatus = 'published' | 'drafts' | 'empty'

export type NavItem = (typeof navItems)[number] & {
  status: NavItemStatus
}

/** Where an empty nav item's ghost link goes */
export function navItemCreateHref(navPath: NavPath) {
  switch (navPath) {
    case ABOUT_PATH:
      return editUrl(`/${ABOUT_PATH}`)
    // roster artists are projects
    case ARTISTS_PATH:
      return newUrl(`/${PagePaths.projects}`)
    default:
      return newUrl(`/${navPath}`)
  }
}

/** Starts with the visible label, so voice control can match it */
export function navItemCreateLabel({
  navPath,
  label
}: Pick<NavItem, 'navPath' | 'label'>) {
  switch (navPath) {
    case ABOUT_PATH:
      return `${label}: create the page`
    case ARTISTS_PATH:
      return `${label}: create the first ${ARTIST_LABEL.toLowerCase()}`
    default:
      return `${label}: create the first ${itemTypeToLabel(navPath, true, true)}`
  }
}
