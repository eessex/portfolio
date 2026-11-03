import { ABOUT_PATH, itemTypeToLabel, PagePaths } from '@/lib/schemas'
import { formattedItemType } from '@/ui/format/items'
import { editUrl, newUrl } from '@/ui/routes'

export const navPaths = [
  PagePaths.events,
  PagePaths.releases,
  ABOUT_PATH
] as const
export type NavPath = (typeof navPaths)[number]

export const navItems = navPaths.map((navPath) => ({
  navPath,
  href: `/${navPath}`,
  label:
    navPath === ABOUT_PATH
      ? 'About'
      : formattedItemType(navPath, false, true).trim()
}))

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
