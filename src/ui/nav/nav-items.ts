import { ABOUT_PATH, PagePaths } from '@/lib/schemas'
import { formattedItemType } from '@/ui/util'

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

/** hasPublishedItems false: drafts only, shown to admins */
export type NavItem = (typeof navItems)[number] & {
  hasPublishedItems: boolean
}
