import { ABOUT_PATH, itemTypeToLabel } from '@/lib/schemas'
import {
  DEFAULT_NAV_ITEMS,
  type NavItemSetting,
  type NavPath,
  navPaths
} from '@/lib/site-settings/nav-paths'
import { formattedItemType } from '@/ui/format/items'
import { editUrl, newUrl } from '@/ui/routes'

export { type NavPath, navPaths }

/** What an item is called without a custom label */
export function defaultNavLabel(navPath: NavPath) {
  return navPath === ABOUT_PATH
    ? 'About'
    : formattedItemType(navPath, false, true).trim()
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
  settings: NavItemSetting[] = DEFAULT_NAV_ITEMS
) {
  return settings.map(({ path }) => navItem(path))
}

/** drafts and empty are shown to admins only */
export type NavItemStatus = 'published' | 'drafts' | 'empty'

export type NavItem = (typeof navItems)[number] & {
  status: NavItemStatus
}

/** Where an empty nav item's ghost link goes */
export function navItemCreateHref(navPath: NavPath) {
  return navPath === ABOUT_PATH
    ? editUrl(`/${ABOUT_PATH}`)
    : newUrl(`/${navPath}`)
}

/** Starts with the visible label, so voice control can match it */
export function navItemCreateLabel({
  navPath,
  label
}: Pick<NavItem, 'navPath' | 'label'>) {
  return navPath === ABOUT_PATH
    ? `${label}: create the page`
    : `${label}: create the first ${itemTypeToLabel(navPath, true, true)}`
}
